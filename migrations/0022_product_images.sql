create table if not exists product_images (
  id serial primary key,
  product_id integer not null references products (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create index if not exists product_images_product_idx on product_images (product_id, sort_order);

insert into product_images (product_id, url, sort_order)
select id, image_url, 0
from products
where image_url <> ''
  and not exists (select 1 from product_images pi where pi.product_id = products.id);
