import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { canonical, permitted, inQuietHours, canTransition } from '../src/lib/portal/csr-policy.ts';
import { authorizeCsrSession, createCsrSession, digest, handleCsrResource, runConfirmedAction, saveCsrProfile, saveCsrSite } from '../src/lib/portal/csr-store.ts';
import { ingestCsrEvent, verifyCsrEvent } from '../src/lib/portal/csr-events.ts';

let pg,sql,customerId,otherId;
const allowed={canTicket:true,canShop:true,canPurchase:true,canPayNow:true,canOrderIt:true,canOrderPhone:true,canDefer:false};
const request=(resource,method='GET',body,actionId)=>new Request(`https://portal.invalid/api/agent/customers/${customerId}/${resource}`,{method,headers:{'Content-Type':'application/json',...(actionId?{'X-MTS-Action-Id':actionId}:{})},body:body===undefined?undefined:JSON.stringify(body)});
const resource=async(path,method='GET',body)=>handleCsrResource(request(path,method,body),sql,customerId,null,allowed);
before(async()=>{
  pg=new PGlite();await pg.waitReady;
  for(const file of (await readdir(new URL('../migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await pg.exec(await readFile(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
  // Migration is safe to rerun, as deployment/preview may initialize concurrently.
  await pg.exec(await readFile(new URL('../migrations/0037_csr_workspace.sql',import.meta.url),'utf8'));
  sql=async(strings,...values)=>{let query=strings[0];values.forEach((_,i)=>query+=`$${i+1}${strings[i+1]}`);return (await pg.query(query,values)).rows;};
  sql.query=async(query,values=[]) => (await pg.query(query,values)).rows;
  customerId=(await sql`insert into shop_customers(email,name,password_hash,session_token,session_expires,email_verified) values('csr-test@example.com','CSR Test','unused','test-session',now()+interval '1 hour',true) returning id`)[0].id;
  otherId=(await sql`insert into shop_customers(email,name,password_hash,session_token,session_expires,email_verified) values('csr-other@example.com','Other','unused','other-session',now()+interval '1 hour',true) returning id`)[0].id;
  await sql`insert into "user"(id,name,email,"emailVerified") values('csr-auth-user','CSR Test','csr-test@example.com',true)`;
  await sql`insert into "session"(id,"userId",token,"expiresAt","updatedAt") values('csr-auth-session','csr-auth-user','auth-token',now()+interval '1 hour',now())`;

});
after(async()=>{await pg?.close();});

test('customer grants govern both payment-method spellings and service ordering',()=>{
  const support={...allowed,canShop:false,canPurchase:false,canOrderIt:false,canOrderPhone:false};
  assert.equal(permitted(support,'POST','orders',{items:[]}),false);
  assert.equal(permitted(allowed,'POST','orders',{payLater:true}),false);
  assert.equal(permitted(allowed,'POST','orders',{paymentMethod:'pay_later'}),false);
  assert.equal(permitted(support,'POST','services',{offering:'voip-ext'}),false);
  assert.equal(permitted(support,'POST','tickets',{}),true);
  assert.equal(canonical({b:2,a:{d:4,c:3}}),canonical({a:{c:3,d:4},b:2}));
});

test('support tokens are bound to the authenticated portal session and revoked on logout',async()=>{
  const token=await createCsrSession(sql,customerId,await digest('test-session'),'csr-auth-session');
  assert.equal((await authorizeCsrSession(sql,`Bearer ${token}`)).customerId,customerId);
  assert.equal(await authorizeCsrSession(sql,'Bearer csr_invalid'),null);
  await sql`update shop_customers set session_token='rotated-session' where id=${customerId}`;
  assert.equal(await authorizeCsrSession(sql,`Bearer ${token}`),null);
  await assert.rejects(createCsrSession(sql,customerId,await digest('test-session'),'csr-auth-session'),/expired/);
  await sql`update shop_customers set session_token='test-session' where id=${customerId}`;
});

test('profile changes cannot grant purchasing rights and sites cannot be overwritten across accounts',async()=>{
  await saveCsrProfile(sql,customerId,{preferred_name:'Alex',timezone:'Asia/Manila',role:'owner',grant_invoice:true});
  assert.equal((await sql`select preferred_name from csr_profiles where customer_id=${customerId}`)[0].preferred_name,'Alex');
  assert.equal((await sql`select grant_invoice from shop_customers where id=${customerId}`)[0].grant_invoice,false);
  const site=await saveCsrSite(sql,customerId,{name:'Main office',address:'123 Main St'});
  await assert.rejects(saveCsrSite(sql,otherId,{id:site.id,name:'Wrong account',address:'Other'}),/not found/);
  await assert.rejects(saveCsrProfile(sql,customerId,{timezone:'Invalid/Timezone'}),/timezone/);
});

async function prepareAndAccept(path,body){
  const prepared=await resource('confirmations','POST',{method:'POST',path:`/api/agent/customers/${customerId}/${path}`,body});
  assert.equal(prepared.status,201);const action=await prepared.json();
  assert.equal((await resource(`confirmations/${action.id}/accept`,'POST',{})).status,200);
  return action.id;
}

test('confirmed actions execute once, return the original receipt, and reject changed payloads',async()=>{
  const body={subject:'Network outage',body:'Office is offline'};let executions=0;
  const execute=async()=>{executions++;return Response.json({ticketId:123});};
  assert.equal((await runConfirmedAction(request('tickets','POST',body),sql,customerId,allowed,execute)).status,428);
  const id=await prepareAndAccept('tickets',body);
  assert.equal((await runConfirmedAction(request('tickets','POST',body,id),sql,customerId,allowed,execute)).status,200);
  assert.deepEqual(await (await runConfirmedAction(request('tickets','POST',body,id),sql,customerId,allowed,execute)).json(),{ticketId:123});
  assert.equal(executions,1);
  assert.equal((await runConfirmedAction(request('tickets','POST',{...body,subject:'Changed'},id),sql,customerId,allowed,execute)).status,428);
});

test('uncertain writes enter manual review and cannot execute twice',async()=>{
  const body={subject:'Check timeout',body:'Status uncertain'},id=await prepareAndAccept('tickets',body);
  await assert.rejects(runConfirmedAction(request('tickets','POST',body,id),sql,customerId,allowed,async()=>{throw new Error('remote timeout');}),/timeout/);
  assert.equal((await (await resource(`confirmations/${id}`)).json()).status,'manual_review');
  let repeated=false;
  assert.equal((await runConfirmedAction(request('tickets','POST',body,id),sql,customerId,allowed,async()=>{repeated=true;return Response.json({});})).status,409);
  assert.equal(repeated,false);
});

test('checkout quotes include shipping and changing a catalog price invalidates consent',async()=>{
  await sql`insert into products(sku,name,category,price_cents,stock,available) values('CSR-TEST','Test handset','phone',10000,10,true)`;
  const body={items:[{sku:'CSR-TEST',quantity:2}],shippingMethod:'standard'};
  const id=await prepareAndAccept('orders',body);
  const action=await (await resource(`confirmations/${id}`)).json();assert.match(action.title,/Total: \$215.00/);
  await sql`update products set price_cents=11000 where sku='CSR-TEST'`;
  let executed=false;
  assert.equal((await runConfirmedAction(request('orders','POST',body,id),sql,customerId,allowed,async()=>{executed=true;return Response.json({});})).status,409);
  assert.equal(executed,false);
  const renewed=await (await resource('confirmations','POST',{method:'POST',path:`/api/agent/customers/${customerId}/orders`,body})).json();
  assert.notEqual(renewed.id,id);assert.equal(renewed.status,'pending');
});

test('conversation history is durable, idempotent, and customer-scoped',async()=>{
  const conversation=await (await resource('conversations','POST',{})).json();
  const path=`conversations/${conversation.id}/messages`;
  for(const body of ['Hello','Hello again'])assert.equal((await resource(path,'POST',{externalId:'message-1',role:'user',body})).status,200);
  const messages=await (await resource(path)).json();assert.equal(messages.length,1);assert.equal(messages[0].body,'Hello again');
  const foreign=await handleCsrResource(new Request(`https://portal.invalid/api/agent/customers/${otherId}/${path}`),sql,otherId,null,allowed);
  assert.equal(foreign.status,404);
});

test('knowledge lookup includes only approved guides for the selected organization',async()=>{
  await sql`insert into organizations(id,name) values(901,'CSR org'),(902,'Other org')`;
  await sql`insert into csr_knowledge(id,organization_id,title,body,approved) values('csr-visible',901,'VPN help','VPN approved',true),('csr-hidden',902,'VPN private','VPN secret',true),('csr-draft',901,'VPN draft','VPN unapproved',false)`;
  const result=await handleCsrResource(new Request(`https://portal.invalid/api/agent/customers/${customerId}/knowledge?q=VPN`),sql,customerId,901,allowed);
  assert.deepEqual((await result.json()).map(item=>item.id),['csr-visible']);
});

test('signed billing events resist replay and stale updates and preserve customer ownership',async()=>{
  const event={eventId:'billing-1',source:'test-ledger',type:'billing.document',customerId,externalId:'inv-1',number:'INV-1',currency:'USD',totalCents:10000,outstandingCents:5000,status:'open',updatedAt:'2026-11-07T10:00:00Z'};
  const raw=JSON.stringify(event),timestamp=String(Date.now());
  const signature=createHmac('sha256','test-secret').update(`${timestamp}.${raw}`).digest('hex');
  assert.doesNotThrow(()=>verifyCsrEvent(raw,timestamp,signature,'test-secret'));
  assert.throws(()=>verifyCsrEvent(raw+' ',timestamp,signature,'test-secret'),/signature/);
  assert.throws(()=>verifyCsrEvent(raw,'1',signature,'test-secret'),/timestamp/);
  assert.equal((await ingestCsrEvent(sql,event)).processed,true);
  assert.equal((await ingestCsrEvent(sql,event)).processed,false);
  await ingestCsrEvent(sql,{...event,eventId:'billing-old',outstandingCents:10000,updatedAt:'2026-11-06T10:00:00Z'});
  assert.equal((await sql`select outstanding_cents from csr_billing_documents where source='test-ledger'`)[0].outstanding_cents,5000);
  await assert.rejects(ingestCsrEvent(sql,{...event,eventId:'billing-other',customerId:otherId}),/different customer/);
});

test('service activation needs provider confirmation; status triggers queue notifications without a browser',async()=>{
  const id=(await sql`insert into service_requests(shop_customer_id,service_name,status) values(${customerId},'VoIP extension','requested') returning id`)[0].id;
  const event={customerId,source:'provider',type:'service.status',requestId:id,eventId:'service-1',status:'active'};
  await assert.rejects(ingestCsrEvent(sql,event),/transition/);
  await ingestCsrEvent(sql,{...event,status:'approved'});
  await ingestCsrEvent(sql,{...event,eventId:'service-2',status:'provider_pending'});
  await assert.rejects(ingestCsrEvent(sql,{...event,eventId:'service-3'}),/reference/);
  await ingestCsrEvent(sql,{...event,eventId:'service-3',providerReference:'TEL-42'});
  const queued=await sql`select count(*)::integer as count from csr_push_outbox where customer_id=${customerId}`;
  assert.equal(queued[0].count,3);
  assert.equal(canTransition('active','requested'),false);
  assert.equal(inQuietHours(new Date('2026-11-07T15:00:00Z'),'Asia/Manila',22,7),true);
  assert.equal(inQuietHours(new Date('2026-11-07T07:00:00Z'),'Asia/Manila',22,7),false);
});

test('push subscription rejects arbitrary outbound fetch destinations',async()=>{
  await assert.rejects(resource('push','POST',{subscription:{endpoint:'https://127.0.0.1/internal',keys:{p256dh:'test',auth:'test'}}}),/Unsupported/);
});

test('deleting the actual sign-in session revokes CSR access immediately',async()=>{
  const token=await createCsrSession(sql,customerId,await digest('test-session'),'csr-auth-session');
  await sql`delete from "session" where id='csr-auth-session'`;
  assert.equal(await authorizeCsrSession(sql,`Bearer ${token}`),null);
});

test('an identical uncertain request cannot open another confirmation',async()=>{
  const body={subject:'Prevent duplicate uncertain request',body:'Please investigate'};
  const id=await prepareAndAccept('tickets',body);
  await assert.rejects(runConfirmedAction(request('tickets','POST',body,id),sql,customerId,allowed,async()=>{throw new Error('transport lost');}));
  await assert.rejects(resource('confirmations','POST',{method:'POST',path:`/api/agent/customers/${customerId}/tickets`,body}),/awaiting reconciliation/);
  assert.equal((await sql`select count(*)::integer as count from csr_actions where customer_id=${customerId} and id=${id}`)[0].count,1);
});
