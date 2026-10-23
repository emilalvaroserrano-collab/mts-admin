update products set
  name = 'Studio laptop 14',
  category = 'Laptops',
  description = 'Light notebook for dispatch, clinic, and studio desks.',
  specs = '14-inch display, 16 GB memory, 512 GB storage'
where id = 1;

update products set
  category = 'Accessories',
  description = 'One cable for two displays and a wired network.',
  specs = 'Dual HDMI, gigabit ethernet, 100 W pass-through'
where id = 2;

update products set
  name = '27-inch desk display',
  category = 'Displays',
  description = 'A quiet screen for the front desk or a studio bench.',
  specs = '27-inch IPS, 2560x1440, height-adjust stand'
where id = 3;

update products set
  category = 'Accessories',
  description = 'Call headset with a noise-limiting mic.'
where id = 4;

update products set
  name = 'Compact desk PC',
  category = 'PCs',
  description = 'A small desktop for shared floors and teller stations.',
  specs = 'Desktop, 16 GB memory, 512 GB storage',
  price_cents = 89900
where id = 5;

update products set category = 'Accessories' where id = 6;

update products set
  name = 'Conference camera',
  category = 'Accessories',
  description = 'A fixed camera for small meeting rooms.'
where id = 7;

update products set
  name = 'All-in-one desk PC',
  category = 'PCs',
  description = 'Screen and computer together for a reception desk.',
  specs = '24-inch display, 16 GB memory, wireless keyboard',
  price_cents = 109900,
  available = true
where id = 8;
