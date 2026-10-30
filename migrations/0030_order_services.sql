insert into products (sku, name, category, description, specs, price_cents, stock, image_url, available, visibility)
select 'desk-phone', 'Desk phone', 'Phones', 'Handset shipped with a new VoIP extension.', 'SIP desk phone for a Telxent extension', 12900, 40, '/catalog/desk-webcam.jpg', true, 'all'
where not exists (select 1 from products where sku = 'desk-phone');
