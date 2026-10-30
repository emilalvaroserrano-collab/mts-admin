insert into products (sku, name, category, description, specs, price_cents, stock, image_url, available, visibility)
select v.sku, v.name, v.category, v.description, v.specs, v.price_cents, v.stock, v.image_url, true, 'all'
from (
  values
    ('MT-L16', 'Studio laptop 16', 'Laptops', 'A larger notebook for design review and long desk days.', '16-inch display, 32 GB memory, 1 TB storage', 168900, 8, '/catalog/laptop-16.jpg'),
    ('MT-MS1', 'Wireless mouse', 'Accessories', 'A quiet mouse for shared desks and travel kits.', 'Bluetooth, USB-C charge, silent clicks', 4900, 24, '/catalog/mouse.jpg'),
    ('MT-A1', 'Monitor arm', 'Accessories', 'Lift a display off the desk and free the work surface.', 'Fits 17 to 32 inch screens, clamp or grommet', 12900, 14, '/catalog/monitor-arm.jpg'),
    ('MT-S1', 'Portable SSD', 'Accessories', 'Pocket drive for handoff files and laptop backups.', '1 TB, USB-C, metal shell', 9900, 20, '/catalog/ssd.jpg'),
    ('MT-C4', 'Desk webcam', 'Accessories', 'A small camera for calls from any laptop.', '4K, privacy shutter, USB-C', 8900, 16, '/catalog/webcam.jpg'),
    ('MT-PR1', 'Compact printer', 'Accessories', 'A quiet laser printer for a front desk or clinic.', 'Wireless, duplex, letter and A4', 21900, 6, '/catalog/printer.jpg')
) as v(sku, name, category, description, specs, price_cents, stock, image_url)
where not exists (select 1 from products p where p.sku = v.sku);
