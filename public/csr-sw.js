self.addEventListener('push',event=>{
  let data={};try{data=event.data?.json()||{};}catch{return;}
  event.waitUntil(self.registration.showNotification(data.title||'Manage Tech Services',{body:data.body||'Your account has an update.',tag:data.tag||'mts-update',data:{href:data.href||'/portal/notifications'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const path=String(event.notification.data?.href||'/portal/notifications');
  const url=new URL(path.startsWith('/portal/')&&!path.startsWith('//')?path:'/portal/notifications',self.location.origin);
  event.waitUntil(self.clients.openWindow(url.href));
});
