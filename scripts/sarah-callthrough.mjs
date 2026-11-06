import { createServer } from "vite";

process.env.XAI_API_KEY = "";
process.env.SARAH_ACTION_ENGINE = "1";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const db = await vite.ssrLoadModule("/src/lib/db.ts");
const sarah = await vite.ssrLoadModule("/src/lib/portal/sarah.ts");
const sql = await db.getSql();
const stamp = Date.now();
const email = `callthrough-${stamp}@example.test`;
const token = `call-${stamp}`;

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  await sql`
    insert into shop_customers (email, name, password_hash, phone, session_token, session_expires, role_id, grant_shop, grant_services)
    values (${email}, 'Casey Lane', 'x', '8185550100', ${token}, now() + interval '1 day', 'authorized', true, true)
  `;
  const customer = await sql`select id from shop_customers where email = ${email}`;
  const customerId = customer[0].id;
  await sql`
    insert into tickets (subject, status, requester_name, requester_email, updated_at)
    values ('Printer jam', 'open', 'Casey Lane', ${email}, now() - interval '2 hours')
  `;
  await sql`
    insert into tickets (subject, status, requester_name, requester_email, updated_at)
    values ('Outlook password', 'pending', 'Casey Lane', ${email}, now() - interval '1 hour')
  `;
  const ticketRows = await sql`
    select id, subject from tickets where lower(requester_email) = lower(${email}) order by updated_at desc
  `;
  const secondId = String(ticketRows[1].id);

  async function say(text, actionId = "") {
    return sarah.runSarahTurn({ token, text, channel: "chat", actionId, history: [] });
  }

  async function press(decision, actionId) {
    return sarah.executeSarahDecision(token, actionId, decision);
  }

  const listed = await say("show me my tickets");
  check("1. List tickets without leaving the page", listed.navigate === false && listed.cards?.length === 2 && listed.reply.includes("Casey"), listed.reply);

  const opened = await say("open the second ticket");
  check("2. Open the second listed ticket", opened.navigate === true && opened.show?.ticketId === secondId, `ticket ${opened.show?.ticketId}`);

  const askPhone = await say("I need another extension");
  const beforeAsk = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId}`;
  check("3. Extension asks about a desk phone before pricing", /desk phone/i.test(askPhone.reply) && !askPhone.quote && beforeAsk[0].n === 0, askPhone.reply);

  const quote = await say("no");
  check("3b. No desk phone still quotes eighteen dollars a month", quote.quote?.amount === "$18 per month" && /no desk phone/i.test(quote.reply), quote.reply);
  const openQuote = await sql`select status, amount_cents, quantity from pending_action_confirmations where action_id = ${quote.actionId}`;
  check("3c. The eighteen dollar quote is stored before anyone says yes", openQuote[0]?.status === "open" && Number(openQuote[0]?.amount_cents) === 1800 && Number(openQuote[0]?.quantity) === 1, JSON.stringify(openQuote[0] || {}));

  const price = await say("eighteen dollars", quote.actionId);
  const still = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId}`;
  check("4. Saying the price is not a yes", still[0].n === 0 && price.actionId === quote.actionId, price.reply);

  const spokenYes = await say("Yes, I confirm.", quote.actionId);
  const beforePress = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'voip-ext'`;
  check("5. Saying yes does not send the quote", beforePress[0].n === 0 && spokenYes.actionId === quote.actionId, spokenYes.reply);

  const placed = await press("confirm", quote.actionId);
  const once = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'voip-ext'`;
  check("5b. Confirm sends one extension and returns the stored receipt", once[0].n === 1 && placed.receipt?.reference?.startsWith("Request") && placed.receipt?.amount === "$18 per month" && /not active/i.test(placed.receipt?.note || ""), `${placed.receipt?.reference} ${placed.receipt?.amount}`);
  const accepted = await sql`select status from pending_action_confirmations where action_id = ${quote.actionId}`;
  check("5c. Confirm marks that stored quote accepted", accepted[0]?.status === "accepted", accepted[0]?.status);

  const again = await press("confirm", quote.actionId);
  const stillOnce = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'voip-ext'`;
  check("6. Pressing Confirm again does not place another", stillOnce[0].n === 1 && /isn't open|already/i.test(again.reply), again.reply);

  const wiring = await say("I need wiring for 2 drops");
  const changed = await say("make it 3", wiring.actionId);
  const unsent = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'wiring'`;
  const wiringYes = await press("confirm", changed.actionId);
  const wiringRows = await sql`select details from service_requests where shop_customer_id = ${customerId} and category = 'wiring'`;
  check(
    "7. Changing to 3 drops requotes $525 and places one request",
    wiring.quote?.amount === "$350" && changed.quote?.amount === "$525" && unsent[0].n === 0 && wiringRows.length === 1 && String(wiringRows[0].details).includes("Drops: 3"),
    `${wiring.quote?.amount} -> ${changed.quote?.amount}; ${wiringYes.reply}`,
  );
  const oldQuote = await sql`select status from pending_action_confirmations where action_id = ${wiring.actionId}`;
  const newQuote = await sql`select status, amount_cents from pending_action_confirmations where action_id = ${changed.actionId}`;
  check("7b. Changing the drops cancels the old quote and stores $525", oldQuote[0]?.status === "cancelled" && newQuote[0]?.status === "accepted" && Number(newQuote[0]?.amount_cents) === 52500, `${oldQuote[0]?.status} / ${newQuote[0]?.status} ${newQuote[0]?.amount_cents}`);

  await sql`
    insert into agent_actions (id, customer_id, tool_name, status, idempotency_key, parameters_json, updated_at)
    values (${`stuck-${stamp}`}, ${customerId}, 'order_service', 'executing', ${`stuck-${stamp}`}, '{"tool":"order_service","offering":"fax-physical"}', now() - interval '30 seconds')
  `;
  const phone = await say("change my phone to 818-555-0199");
  const saved = await sql`select phone from shop_customers where id = ${customerId}`;
  const confirmed = await press("confirm", phone.actionId);
  const after = await sql`select phone from shop_customers where id = ${customerId}`;
  const stuck = await sql`select status from agent_actions where id = ${`stuck-${stamp}`}`;
  check(
    "8. Phone waits for yes, and a lost request stays checking",
    saved[0].phone === "8185550100" && after[0].phone.includes("818-555-0199") && phone.quote?.amount?.includes("818-555-0199") && stuck[0].status === "checking_status",
    `${phone.quote?.amount}; status ${stuck[0].status}; ${confirmed.reply}`,
  );

  const outage = await say("Our whole office network is down.");
  const networkOrders = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'network'`;
  check("9. A network outage opens a ticket, not a service order", networkOrders[0].n === 0 && /ticket/i.test(outage.reply) && !/ha|haha/i.test(outage.reply), outage.reply);

  const otherEmail = `other-${stamp}@example.test`;
  await sql`
    insert into shop_customers (email, name, password_hash, phone, session_token, session_expires, role_id)
    values (${otherEmail}, 'Other Org', 'x', '8185550198', ${`other-${stamp}`}, now() + interval '1 day', 'regular')
  `;
  await sql`
    insert into tickets (subject, status, requester_name, requester_email)
    values ('Secret payroll', 'open', 'Other Org', ${otherEmail})
  `;
  const secret = await sql`select id from tickets where subject = 'Secret payroll'`;
  const leak = await say(`reply to ticket ${secret[0].id} hello`);
  const seen = await sql`select count(*)::int as n from ticket_comments where ticket_id = ${secret[0].id}`;
  check("10. Another customer's ticket stays hidden", seen[0].n === 0 && /can't find|this account/i.test(leak.reply), leak.reply);

  const blockedToken = `blocked-${stamp}`;
  await sql`
    insert into shop_customers (email, name, password_hash, phone, session_token, session_expires, role_id, grant_shop, grant_services)
    values (${`blocked-${stamp}@example.test`}, 'No Services', 'x', '8185550102', ${blockedToken}, now() + interval '1 day', 'regular', false, false)
  `;
  const blocked = await sarah.runSarahTurn({ token: blockedToken, text: "I need another extension", channel: "chat", actionId: "", history: [] });
  check("11. An account without phone service cannot order an extension", /isn't set up/i.test(blocked.reply), blocked.reply);

  const joke = await say("My printer only works whenever it feels like it.");
  const printerTickets = await sql`select count(*)::int as n from tickets where lower(requester_email) = lower(${email}) and subject ilike '%printer only works%'`;
  check("12. A flaky printer gets a question, not a catalog add or a ticket", printerTickets[0].n === 0 && /one printer/i.test(joke.reply) && joke.navigate === false, joke.reply);

  let extraQuote = await say("I need another extension");
  if (!extraQuote.actionId) extraQuote = await say("no");
  const beforeCancel = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'voip-ext'`;
  const cancelled = await press("cancel", extraQuote.actionId);
  const afterCancel = await sql`select count(*)::int as n from service_requests where shop_customer_id = ${customerId} and category = 'voip-ext'`;
  const closed = await sql`select status from pending_action_confirmations where action_id = ${extraQuote.actionId}`;
  check("13. Cancel closes the quote and sends nothing", cancelled.status === "cancelled" && afterCancel[0].n === beforeCancel[0].n && closed[0]?.status === "cancelled", cancelled.reply);
} catch (error) {
  console.error(error);
  results.push({ name: "runner", ok: false, detail: error instanceof Error ? error.message : String(error) });
} finally {
  await vite.close();
}

const failed = results.filter((item) => !item.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
