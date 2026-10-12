-- =====================================================================
-- FASHION SEED: 50 main categories -> subcategories -> products -> variants
-- Re-run safe (pehle purana data FK order me delete hota hai)
-- =====================================================================

-- 0. Schema tweaks
ALTER TABLE public.vendors ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS age_group text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS size_type text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS attributes jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS available_sizes jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS available_colors jsonb;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS age_group text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fabric text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fit text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pattern text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS occasion text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS season text;

-- 1. Purana data clear (FK-safe order)
DELETE FROM public.cart_items;
DELETE FROM public.order_items;
DELETE FROM public.order_timeline;
DELETE FROM public.orders;
DELETE FROM public.product_variants;
DELETE FROM public.products;
DELETE FROM public.categories;

-- 2. Lookup tables (temp)
DROP TABLE IF EXISTS seed_sizes;
DROP TABLE IF EXISTS seed_colors;
DROP TABLE IF EXISTS seed_main;
DROP TABLE IF EXISTS seed_sub;
DROP TABLE IF EXISTS seed_img_kw;
DROP TABLE IF EXISTS seed_img_urls;

CREATE TEMP TABLE seed_sizes (size_type text, sizes text[]);
INSERT INTO seed_sizes VALUES
('M',  ARRAY['S','M','L','XL','XXL','XXXL']),
('W',  ARRAY['XS','S','M','L','XL','XXL']),
('U',  ARRAY['S','M','L','XL','XXL']),
('FM', ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11']),
('FW', ARRAY['UK 3','UK 4','UK 5','UK 6','UK 7','UK 8']),
('FK', ARRAY['UK 10','UK 11','UK 12']),
('K',  ARRAY['1-2 Years','2-5 Years','5-10 Years','10-15 Years']),
('B',  ARRAY['Newborn','0-3 Months','3-6 Months','6-12 Months']),
('O',  ARRAY['Free Size']);

CREATE TEMP TABLE seed_colors (idx int, name text, hex text);
INSERT INTO seed_colors VALUES
(0,'Black','#000000'),(1,'White','#FFFFFF'),(2,'Navy Blue','#000080'),(3,'Red','#D32F2F'),
(4,'Olive Green','#556B2F'),(5,'Sky Blue','#87CEEB'),(6,'Maroon','#800000'),(7,'Mustard','#E1AD01');

-- 3. 50 main categories (SHORT names: gender column pehle se hai, isliye "Men's/Women's" nahi)
CREATE TEMP TABLE seed_main (
  n int, name text, slug text, gender text, age_group text, size_type text, noun text, subs text
);

INSERT INTO seed_main VALUES
-- MEN CLOTHING (1-12)
(1,  'T-Shirts & Polos',        'mens-tshirts-polos',   'Men','Adult','M','T-Shirt', 'Slim Fit,Regular Fit,Oversized,Printed,Plain,Full Sleeve,Half Sleeve,Polo'),
(2,  'Shirts',                  'mens-shirts',          'Men','Adult','M','Shirt',   'Formal,Casual,Slim Fit,Regular Fit,Printed,Checked,Linen,Party Wear'),
(3,  'Jeans',                   'mens-jeans',           'Men','Adult','M','Jeans',   'Slim Fit,Regular Fit,Skinny Fit,Relaxed Fit,Ripped,Stretchable,Dark Wash'),
(4,  'Trousers & Chinos',       'mens-trousers-chinos', 'Men','Adult','M','',        'Formal Trousers,Chinos,Slim Fit Trousers,Regular Fit Trousers,Pleated Trousers,Casual Trousers'),
(5,  'Cargo & Shorts',          'mens-cargo-shorts',    'Men','Adult','M','',        'Cargo Pants,Cargo Shorts,Denim Shorts,Casual Shorts,Sports Shorts,Bermuda Shorts'),
(6,  'Jackets & Suits',         'mens-jackets-suits',   'Men','Adult','M','',        'Casual Jackets,Bomber Jackets,Denim Jackets,Leather Jackets,Blazers,Two-Piece Suits,Three-Piece Suits,Nehru Jackets'),
(7,  'Hoodies & Sweatshirts',   'mens-hoodies',         'Men','Adult','M','',        'Hoodies,Zip Hoodies,Sweatshirts,Oversized Hoodies,Printed Sweatshirts,Plain Sweatshirts'),
(8,  'Ethnic Wear',             'mens-ethnic',          'Men','Adult','M','',        'Kurtas,Kurta Pyjama Sets,Sherwanis,Bandhgala Suits,Indo-Western Sets,Dhotis,Pyjamas'),
(9,  'Innerwear & Thermals',    'mens-innerwear',       'Men','Adult','M','',        'Briefs,Trunks,Boxers,Vests,Thermal Tops,Thermal Bottoms,Innerwear Combo Packs'),
(10, 'Sleepwear',               'mens-sleepwear',       'Men','Adult','M','',        'Pyjamas,Night Suits,Lounge Pants,Night T-Shirts,Bathrobes,Shorts Sets'),
(11, 'Sportswear',              'mens-sportswear',      'Men','Adult','M','',        'Gym T-Shirts,Gym Shorts,Track Pants,Joggers,Running T-Shirts,Running Shorts,Track Suits'),
(12, 'Swimwear',                'mens-swimwear',        'Men','Adult','M','',        'Swim Shorts,Swim Trunks,Swim Briefs,Rash Guards,Board Shorts'),
-- WOMEN CLOTHING (13-30)
(13, 'Tops & T-Shirts',         'womens-tops',          'Women','Adult','W','',      'Casual Tops,Crop Tops,Peplum Tops,Tunics,T-Shirts,Oversized T-Shirts,Party Tops,Tank Tops'),
(14, 'Shirts',                  'womens-shirts',        'Women','Adult','W','Shirt', 'Formal,Casual,Oversized,Printed,Plain,Linen,Crop'),
(15, 'Jeans & Jeggings',        'womens-jeans',         'Women','Adult','W','',      'Skinny Jeans,Straight Fit Jeans,Boyfriend Jeans,High Waist Jeans,Low Waist Jeans,Wide Leg Jeans,Jeggings'),
(16, 'Trousers & Shorts',       'womens-trousers',      'Women','Adult','W','',      'Formal Trousers,Palazzos,Culottes,Cargo Pants,Denim Shorts,Casual Shorts,Leggings,Track Pants'),
(17, 'Dresses & Jumpsuits',     'womens-dresses',       'Women','Adult','W','',      'Casual Dresses,Party Dresses,Maxi Dresses,Midi Dresses,Bodycon Dresses,A-Line Dresses,Jumpsuits,Co-ord Sets'),
(18, 'Skirts',                  'womens-skirts',        'Women','Adult','W','Skirt', 'Mini,Midi,Maxi,Pleated,A-Line,Denim,Party Wear'),
(19, 'Jackets & Blazers',       'womens-jackets',       'Women','Adult','W','',      'Casual Jackets,Denim Jackets,Leather Jackets,Bomber Jackets,Blazers,Shrugs,Ponchos'),
(20, 'Hoodies & Sweatshirts',   'womens-hoodies',       'Women','Adult','W','',      'Hoodies,Zip Hoodies,Sweatshirts,Oversized Hoodies,Cropped Sweatshirts'),
(21, 'Sarees',                  'womens-sarees',        'Women','Adult','W','Saree', 'Silk,Cotton,Georgette,Banarasi,Bridal,Party Wear,Printed,Embroidered'),
(22, 'Kurtis & Sets',           'womens-kurtis',        'Women','Adult','W','',      'Cotton Kurtis,Printed Kurtis,Anarkali Kurtis,A-Line Kurtis,Straight Kurtis,Kurta Sets,Party Wear Kurtis,Long Kurtis'),
(23, 'Suits & Lehengas',        'womens-suits-lehengas','Women','Adult','W','',      'Salwar Suits,Anarkali Suits,Palazzo Suits,Sharara Sets,Lehengas,Bridal Lehengas,Party Wear Lehengas,Dress Materials'),
(24, 'Blouses & Dupattas',      'womens-ethnic-extras', 'Women','Adult','W','',      'Blouses,Dupattas,Churidars,Patialas,Ethnic Skirts,Stoles,Petticoats'),
(25, 'Bras',                    'womens-bras',          'Women','Adult','W','',      'Push-up Bras,Padded Bras,Non-padded Bras,Wired Bras,Wireless Bras,Sports Bras,Seamless Bras,Lace Bras'),
(26, 'Panties & Shapewear',     'womens-panties',       'Women','Adult','W','',      'Briefs,Hipsters,Bikini Panties,Thongs,Boyshorts,High Waist Panties,Shapewear,Panty Combo Packs'),
(27, 'Lingerie',                'womens-lingerie',      'Women','Adult','W','',      'Lace Lingerie Sets,Bridal Lingerie,Babydolls,Chemises,Camisoles,Slips,Bralettes'),
(28, 'Nightwear',               'womens-nightwear',     'Women','Adult','W','',      'Night Suits,Nighties,Pyjama Sets,Robes,Shorts Sets,Cotton Nightwear,Satin Nightwear'),
(29, 'Activewear',              'womens-sportswear',    'Women','Adult','W','',      'Gym T-Shirts,Gym Shorts,Sports Leggings,Track Pants,Joggers,Running T-Shirts,Yoga Wear,Track Suits'),
(30, 'Swimwear',                'womens-swimwear',      'Women','Adult','W','',      'Swimsuits,Bikinis,Tankinis,Swim Dresses,Cover-ups,Rash Guards'),
-- FOOTWEAR (31-33)
(31, 'Footwear',                'mens-footwear',        'Men','Adult','FM','',       'Sneakers,Running Shoes,Sports Shoes,Training Shoes,Formal Shoes,Casual Shoes,Loafers,Boots,Sandals,Slippers,Flip Flops'),
(32, 'Footwear',                'womens-footwear',      'Women','Adult','FW','',     'Sneakers,Sports Shoes,Running Shoes,Training Shoes,Heels,Flats,Sandals,Slippers,Boots,Juttis,Mojaris,Wedges'),
(33, 'Kids Footwear',           'kids-footwear',        'Kids','5-15 Years','FK','', 'Kids Sneakers,Kids Sports Shoes,Kids Sandals,Kids School Shoes,Kids Slippers,Kids Clogs'),
-- KIDS & BABY (34-36)
(34, 'Kids Clothing',           'kids-clothing',        'Kids','1-15 Years','K','',  'Boys T-Shirts,Girls Tops,Boys Shirts,Girls Dresses,Boys Jeans,Girls Leggings,Boys Shorts,Girls Skirts,Kids Ethnic Wear,Kids Winter Wear,Kids Nightwear,Kids Innerwear'),
(35, 'Baby Clothing',           'baby-clothing',        'Baby','0-12 Months','B','', 'Rompers,Bodysuits,Onesies,Clothing Sets,Frocks,Sleepsuits,Winter Wear,Ethnic Wear'),
(36, 'Baby Accessories',        'baby-accessories',     'Baby','0-12 Months','B','', 'Caps & Mittens,Booties,Bibs,Swaddles & Wraps,Blankets,Hair Bands,Diaper Bags,Baby Socks'),
-- BAGS & ACCESSORIES (37-47)
(37, 'Bags & Backpacks',        'bags-backpacks',       'Unisex','Adult','O','',     'Backpacks,School Bags,College Bags,Laptop Bags,Office Bags,Sling Bags,Crossbody Bags,Gym Bags'),
(38, 'Handbags & Clutches',     'handbags-clutches',    'Women','Adult','O','',      'Handbags,Tote Bags,Shoulder Bags,Clutches,Satchels,Potli Bags,Cosmetic Bags,Pouches'),
(39, 'Wallets & Card Holders',  'wallets',              'Unisex','Adult','O','',     'Men Wallets,Women Wallets,Card Holders,Money Clips,Coin Pouches,Phone Wallets'),
(40, 'Travel Bags & Luggage',   'travel-bags',          'Unisex','Adult','O','',     'Duffel Bags,Trolley Bags,Cabin Luggage,Check-in Luggage,Travel Backpacks,Weekender Bags,Hard Luggage'),
(41, 'Belts',                   'belts',                'Unisex','Adult','O','',     'Men Belts,Women Belts,Leather Belts,Formal Belts,Casual Belts,Canvas Belts,Designer Belts,Reversible Belts'),
(42, 'Caps & Hats',             'caps-hats',            'Unisex','Adult','O','',     'Baseball Caps,Snapback Caps,Sports Caps,Trucker Caps,Bucket Hats,Beanies,Sun Hats,Fedora Hats,Winter Hats'),
(43, 'Socks & Hosiery',         'socks-hosiery',        'Unisex','Adult','O','',     'Men Socks,Women Socks,Kids Socks,Ankle Socks,Crew Socks,Sports Socks,Formal Socks,Compression Socks,No-Show Socks,Stockings,Tights'),
(44, 'Watches',                 'watches',              'Unisex','Adult','O','',     'Analog Watches,Digital Watches,Smart Watches,Sports Watches,Chronograph Watches,Couple Watches,Luxury Watches,Casual Watches'),
(45, 'Sunglasses & Eyewear',    'eyewear',              'Unisex','Adult','O','',     'Aviator Sunglasses,Wayfarer Sunglasses,Round Sunglasses,Square Sunglasses,Rectangle Sunglasses,Cat Eye Sunglasses,Sports Sunglasses,Polarized Sunglasses,Blue Light Glasses,Reading Glasses'),
(46, 'Jewellery',               'jewellery',            'Unisex','Adult','O','',     'Rings,Earrings,Necklaces,Chains,Bracelets,Bangles,Anklets,Pendants,Mangalsutras,Nose Pins'),
(47, 'Fashion Accessories',     'fashion-accessories',  'Unisex','Adult','O','',     'Hair Accessories,Brooches,Cufflinks,Tie Clips,Ties,Bow Ties,Scarves,Handkerchiefs,Gloves'),
-- WINTER / ACTIVE / TRAVEL (48-50)
(48, 'Winter Wear',             'winter-wear',          'Unisex','Adult','U','',     'Sweaters,Cardigans,Jackets,Puffer Jackets,Windcheaters,Thermals,Mufflers,Winter Beanies,Winter Gloves,Winter Socks'),
(49, 'Activewear & Sports Gear','activewear',           'Unisex','Adult','U','',     'Cycling Wear,Yoga Wear,Compression Wear,Sports Jerseys,Track Jackets,Sweatbands & Headbands,Gym Gloves'),
(50, 'Travel Accessories',      'travel-accessories',   'Unisex','Adult','O','',     'Passport Holders,Luggage Tags,Neck Pillows,Travel Organizers,Packing Cubes,Eye Masks,Travel Pouches');

-- 3b. IMAGE MAPPING (gender-correct images)
CREATE TEMP TABLE seed_img_kw (main_slug text, kw text);
INSERT INTO seed_img_kw VALUES
('mens-tshirts-polos','man,tshirt'),('mens-shirts','man,shirt'),('mens-jeans','man,jeans'),
('mens-trousers-chinos','man,trousers'),('mens-cargo-shorts','man,shorts'),('mens-jackets-suits','man,jacket'),
('mens-hoodies','man,hoodie'),('mens-ethnic','man,kurta'),('mens-innerwear','man,underwear'),
('mens-sleepwear','man,pajamas'),('mens-sportswear','man,gym'),('mens-swimwear','man,swimshorts'),
('womens-tops','woman,top'),('womens-shirts','woman,shirt'),('womens-jeans','woman,jeans'),
('womens-trousers','woman,trousers'),('womens-dresses','woman,dress'),('womens-skirts','woman,skirt'),
('womens-jackets','woman,jacket'),('womens-hoodies','woman,hoodie'),('womens-sarees','woman,saree'),
('womens-kurtis','woman,kurti'),('womens-suits-lehengas','woman,lehenga'),('womens-ethnic-extras','woman,dupatta'),
('womens-bras','lingerie,mannequin'),('womens-panties','lingerie,mannequin'),('womens-lingerie','lingerie,mannequin'),
('womens-nightwear','woman,nightwear'),('womens-sportswear','woman,yoga'),('womens-swimwear','swimsuit,mannequin'),
('mens-footwear','man,sneakers'),('womens-footwear','woman,heels'),('kids-footwear','kids,shoes'),
('kids-clothing','kids,clothes'),('baby-clothing','baby,clothes'),('baby-accessories','baby,accessories'),
('bags-backpacks','backpack'),('handbags-clutches','handbag,woman'),('wallets','wallet'),
('travel-bags','luggage'),('belts','belt'),('caps-hats','cap'),('socks-hosiery','socks'),
('watches','watch'),('eyewear','sunglasses'),('jewellery','jewellery'),('fashion-accessories','scarf'),
('winter-wear','sweater'),('activewear','sportswear'),('travel-accessories','passport,travel');

CREATE TEMP TABLE seed_img_urls (main_slug text, urls text[]);

-- 4. Subcategory list (comma split)
CREATE TEMP TABLE seed_sub AS
SELECT
  m.n AS main_n, m.slug AS main_slug, m.gender, m.age_group, m.size_type, m.noun,
  trim(s.name) AS name,
  s.ord::int AS ord,
  m.slug || '-' || trim(both '-' from lower(regexp_replace(trim(s.name), '[^a-zA-Z0-9]+', '-', 'g'))) AS slug
FROM seed_main m
CROSS JOIN LATERAL unnest(string_to_array(m.subs, ',')) WITH ORDINALITY AS s(name, ord);

-- 5a. Main categories insert
INSERT INTO public.categories
  (id, name, slug, description, icon_url, image_url, sort_order, parent_id,
   gender, age_group, size_type, is_active, attributes, available_sizes, available_colors)
SELECT
  md5('main-' || m.slug)::uuid,
  m.name,
  m.slug,
  'Shop ' || m.name || ' from trusted local stores',
  COALESCE(u.urls[1], 'https://loremflickr.com/200/200/' || k.kw || '/all?lock=' || (m.n * 10 + 1)),
  COALESCE(u.urls[2], u.urls[1], 'https://loremflickr.com/800/400/' || k.kw || '/all?lock=' || (m.n * 10 + 2)),
  m.n,
  NULL,
  m.gender, m.age_group, m.size_type, TRUE,
  CASE
    WHEN m.size_type IN ('FM','FW','FK') THEN
      '["gender","age_group","brand","material","color","size","occasion","season","price_range","discount","rating","availability","stock","images","description"]'::jsonb
    WHEN m.size_type = 'O' THEN
      '["gender","brand","material","color","occasion","price_range","discount","rating","availability","stock","images","description"]'::jsonb
    ELSE
      '["gender","age_group","brand","material","fabric","color","size","fit","pattern","occasion","season","price_range","discount","rating","availability","stock","images","description"]'::jsonb
  END,
  to_jsonb(z.sizes),
  (SELECT jsonb_agg(c.name ORDER BY c.idx) FROM seed_colors c)
FROM seed_main m
JOIN seed_sizes z ON z.size_type = m.size_type
LEFT JOIN seed_img_kw k ON k.main_slug = m.slug
LEFT JOIN seed_img_urls u ON u.main_slug = m.slug;

-- 5b. Subcategories insert (main se attributes/sizes/colors copy)
INSERT INTO public.categories
  (id, name, slug, description, icon_url, image_url, sort_order, parent_id,
   gender, age_group, size_type, is_active, attributes, available_sizes, available_colors)
SELECT
  md5('sub-' || s.slug)::uuid,
  s.name,
  s.slug,
  mc.name || ' - ' || s.name,
  COALESCE(u.urls[1], 'https://loremflickr.com/200/200/' || k.kw || '/all?lock=' || (s.main_n * 100 + s.ord)),
  COALESCE(u.urls[2], u.urls[1], 'https://loremflickr.com/600/400/' || k.kw || '/all?lock=' || (s.main_n * 100 + s.ord + 5000)),
  s.main_n * 100 + s.ord,
  mc.id,
  mc.gender, mc.age_group, mc.size_type, TRUE,
  mc.attributes, mc.available_sizes, mc.available_colors
FROM seed_sub s
JOIN public.categories mc ON mc.slug = s.main_slug AND mc.parent_id IS NULL
LEFT JOIN seed_img_kw k ON k.main_slug = s.main_slug
LEFT JOIN seed_img_urls u ON u.main_slug = s.main_slug;

-- 6. Fashion vendors (4 naye)
INSERT INTO public.vendors (id, store_name, business_category, description, logo_url, banner_url, address_line, city, pincode, latitude, longitude, delivery_radius_km, is_open, is_verified, rating, review_count)
SELECT
  ('f0000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
  (ARRAY['Style Street Boutique','Ethnic Elegance','Kids & Co Store','Footwork Shoes'])[i],
  (ARRAY['Fashion','Ethnic Wear','Kids & Baby','Footwear'])[i],
  'Trusted local fashion store with fast delivery and genuine products.',
  'https://picsum.photos/seed/fvendor-logo-' || i || '/200/200',
  'https://picsum.photos/seed/fvendor-banner-' || i || '/800/300',
  (20 + i * 5) || ' Fashion Lane, Sector ' || i,
  'Indore',
  '4520' || lpad((20 + i)::text, 2, '0'),
  22.71 + i * 0.01,
  75.86 + i * 0.01,
  5 + i,
  TRUE, TRUE,
  round((4 + random() * 0.9)::numeric, 1),
  20 + floor(random() * 200)::int
FROM generate_series(1, 4) AS i
ON CONFLICT (id) DO NOTHING;

-- 7. Products: har subcategory ke 10 products (category_id = SUBCATEGORY id)
WITH base AS MATERIALIZED (
  SELECT
    s.slug, s.main_slug, s.name, s.noun, s.gender, s.age_group, s.size_type, s.main_n, g.n,
    (s.size_type IN ('M','W','K','B','U')) AS is_cloth,
    (abs(hashtext(s.slug || '-' || g.n)::bigint) % 1000000)::int AS h,
    round((9 + random() * 111)::numeric, 2) AS mrp,
    random() AS r2, random() AS r3, random() AS r4, random() AS r5, random() AS r6
  FROM seed_sub s
  CROSS JOIN generate_series(1, 10) AS g(n)
),
prep AS (
  SELECT b.*,
    CASE
      WHEN b.is_cloth THEN
        (ARRAY['Cotton','Polyester','Linen','Denim','Rayon','Wool Blend','Silk Blend','Fleece','Viscose','Cotton Blend'])[(b.h % 10) + 1]
      WHEN b.size_type IN ('FM','FW','FK') THEN
        (ARRAY['Leather','Canvas','Mesh','Synthetic','Rubber'])[(b.h % 5) + 1]
      ELSE
        (ARRAY['Leather','Stainless Steel','Alloy','Polyester','Plastic','Canvas'])[(b.h % 6) + 1]
    END AS mat,
    k.kw,
    u.urls
  FROM base b
  LEFT JOIN seed_img_kw k ON k.main_slug = b.main_slug
  LEFT JOIN seed_img_urls u ON u.main_slug = b.main_slug
),
vend AS (
  SELECT array_agg(id ORDER BY id) AS ids FROM public.vendors
)
INSERT INTO public.products
  (id, vendor_id, category_id, title, description, price, discount_price, images,
   rating, review_count, likes_count, tag, tag_color,
   is_new, is_popular, is_flash_sale, flash_sale_end, stock_qty, is_active,
   gender, age_group, brand, material, fabric, fit, pattern, occasion, season)
SELECT
  md5('prod-' || b.slug || '-' || b.n)::uuid,
  v.ids[(b.h % array_length(v.ids, 1)) + 1],
  md5('sub-' || b.slug)::uuid,
  trim(
    (ARRAY['Classic','Premium','Urban','Essential','Signature','Modern','Trendy','Elite','Everyday','Royal'])[b.n]
    || ' ' ||
    CASE b.gender WHEN 'Men' THEN 'Men''s ' WHEN 'Women' THEN 'Women''s ' ELSE '' END
    || b.name ||
    CASE WHEN b.noun <> '' THEN ' ' || b.noun ELSE '' END
  ),
  'High quality ' || lower(b.name) || ' from a trusted local seller. Comfortable, durable and great value, delivered fast to your doorstep.',
  b.mrp,
  -- discount_price: ya to price se kam, ya NULL (kabhi 0 nahi)
  CASE WHEN b.r2 < 0.8 THEN round((b.mrp * (0.6 + b.r3 * 0.3))::numeric, 2) ELSE NULL END,
  CASE WHEN b.urls IS NOT NULL THEN
    ARRAY[
      b.urls[(b.h % array_length(b.urls, 1)) + 1],
      b.urls[((b.h + 1) % array_length(b.urls, 1)) + 1],
      b.urls[((b.h + 2) % array_length(b.urls, 1)) + 1]
    ]
  ELSE
    ARRAY[
      'https://loremflickr.com/800/800/' || b.kw || '/all?lock=' || (b.h + 1),
      'https://loremflickr.com/800/800/' || b.kw || '/all?lock=' || (b.h + 7919),
      'https://loremflickr.com/800/800/' || b.kw || '/all?lock=' || (b.h + 15877)
    ]
  END,
  round((3.5 + b.r5 * 1.5)::numeric, 1),
  floor(b.r5 * 500)::int,
  floor(b.r4 * 5000)::int,
  CASE WHEN b.n = 10 THEN 'Sale' WHEN b.n <= 2 THEN 'New' WHEN b.r4 >= 0.7 THEN 'Hot' ELSE NULL END,
  CASE WHEN b.n = 10 THEN '#FF3B30' WHEN b.n <= 2 THEN '#004CFF' WHEN b.r4 >= 0.7 THEN '#FF9500' ELSE NULL END,
  (b.n <= 2),
  (b.r4 >= 0.7),
  (b.n = 10),
  CASE WHEN b.n = 10 THEN NOW() + INTERVAL '24 hours' ELSE NULL END,
  20 + floor(b.r2 * 80)::int,
  TRUE,
  CASE WHEN b.name ILIKE 'Boys%' THEN 'Boys' WHEN b.name ILIKE 'Girls%' THEN 'Girls' ELSE b.gender END,
  b.age_group,
  (ARRAY['Urban Threads','Desi Weave','Trendora','Cotton Club','StepUp','Zenfit','Aarav & Co','Velvet Lane','Roots & Co','Nova Wear'])[(b.h % 10) + 1],
  b.mat,
  CASE WHEN b.is_cloth THEN b.mat ELSE NULL END,
  CASE WHEN b.is_cloth THEN (ARRAY['Slim Fit','Regular Fit','Relaxed Fit','Oversized'])[((b.h / 10) % 4) + 1] ELSE NULL END,
  CASE WHEN b.is_cloth THEN (ARRAY['Solid','Printed','Striped','Checked','Embroidered'])[((b.h / 40) % 5) + 1] ELSE NULL END,
  (ARRAY['Casual','Formal','Party','Sports','Festive','Daily Wear'])[((b.h / 200) % 6) + 1],
  (ARRAY['Summer','Winter','All Season','Monsoon'])[((b.h / 1200) % 4) + 1]
FROM prep b
CROSS JOIN vend v;

-- 8. Variants: har product ke 3 colors x available sizes (valid hex, unique SKU)
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, sku, price, stock_qty)
SELECT
  p.id,
  c.name,
  c.hex,
  z.size,
  'SKU-' || upper(substr(md5(p.id::text), 1, 12)) || '-' || k.ci || '-' || z.ord,
  p.price,
  20
FROM public.products p
JOIN public.categories sc ON sc.id = p.category_id
JOIN seed_sizes ss ON ss.size_type = sc.size_type
CROSS JOIN generate_series(0, 2) AS k(ci)
JOIN seed_colors c
  ON c.idx = ((abs(hashtext(p.id::text)::bigint) % 8)::int + k.ci * 3) % 8
CROSS JOIN LATERAL unnest(ss.sizes) WITH ORDINALITY AS z(size, ord);

-- 9. Cleanup
DROP TABLE IF EXISTS seed_img_urls;
DROP TABLE IF EXISTS seed_img_kw;
DROP TABLE IF EXISTS seed_sub;
DROP TABLE IF EXISTS seed_main;
DROP TABLE IF EXISTS seed_colors;
DROP TABLE IF EXISTS seed_sizes;

-- 10. Verify
SELECT
  (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NULL)     AS main_categories,
  (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NOT NULL) AS sub_categories,
  (SELECT COUNT(*) FROM public.vendors)                                AS vendors,
  (SELECT COUNT(*) FROM public.products)                               AS products,
  (SELECT COUNT(*) FROM public.products WHERE is_active)               AS active_products,
  (SELECT COUNT(*) FROM public.products WHERE discount_price IS NOT NULL AND discount_price >= price) AS bad_discounts,
  (SELECT COUNT(*) FROM public.products WHERE is_new)                  AS new_items,
  (SELECT COUNT(*) FROM public.products WHERE is_popular)              AS popular_items,
  (SELECT COUNT(*) FROM public.products WHERE is_flash_sale)           AS flash_sale_items,
  (SELECT COUNT(*) FROM public.product_variants)                       AS variants;
