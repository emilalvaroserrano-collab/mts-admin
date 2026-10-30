update shop_customers
set grant_shop = true,
    role_id = case when role_id = 'regular' then 'buyer' else role_id end
where grant_shop = false;

