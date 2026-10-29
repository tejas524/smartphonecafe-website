-- ============================================================================
--  SmartphoneCafe - seed data
-- ============================================================================
--  GENERATED FILE - DO NOT EDIT BY HAND.
--  Produced by database/generate-seed.mjs, which imports the real data from
--  frontend/src/data/*.js so the values below cannot drift from the site.
--
--  Regenerate with:  npm run db:seed:generate
--  Apply with:       mysql --defaults-extra-file=<cnf> < database/seed.sql
--
--  EVERY value here is either supplied by the shop brief or extracted from
--  the public Google Maps listing (docs/google-maps-findings.md). Nothing is
--  inferred or invented. Commercial fields - prices, discounts, stock,
--  warranties and current offers - are deliberately left NULL because the
--  shop has not published them. NULL means 'not stated'.
--
--  No admin user is created here, on purpose. See database/README.md.
-- ============================================================================

USE `smartphonecafe`;

-- Re-runnable: clear child tables before parents.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `homepage_content`;
TRUNCATE TABLE `gallery`;
TRUNCATE TABLE `accessories`;
TRUNCATE TABLE `accessory_categories`;
TRUNCATE TABLE `repair_services`;
TRUNCATE TABLE `smartphones`;
TRUNCATE TABLE `brands`;
TRUNCATE TABLE `offers`;
TRUNCATE TABLE `business_info`;
TRUNCATE TABLE `reviews`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- business_info - verified facts, seeded from frontend/src/data/site.js
-- ---------------------------------------------------------------------------
INSERT INTO `business_info` (
  `info_key`,   `info_value`,   `info_group`,   `label`,   `value_type`,   `source_note`,   `is_public`,   `display_order`
) VALUES
  ('business_name', 'SmartphoneCafe', 'identity', 'Business name', 'text', 'Supplied in the shop brief', 1, 10),
  ('listing_name', 'Smart Phone Cafe', 'identity', 'Name on Google listing', 'text', 'Google Maps listing', 1, 20),
  ('tagline', 'Smartphones · Repairs · Accessories', 'identity', 'Tagline', 'text', 'Shop brief', 1, 30),
  ('business_type', 'Mobile phone store & mobile phone repair shop', 'identity', 'Business type', 'text', 'Derived from Google Maps categories', 1, 40),
  ('phone_display', '+91 99225 99577', 'contact', 'Phone (display)', 'text', 'Google Maps listing', 1, 50),
  ('phone_e164', '+919922599577', 'contact', 'Phone (E.164)', 'tel', 'Google Maps listing', 1, 60),
  ('whatsapp_number', '919922599577', 'contact', 'WhatsApp number', 'tel', 'Shop brief', 1, 70),
  ('email', NULL, 'contact', 'Email address', 'email', 'Not published on the Google listing', 1, 80),
  ('address_line1', 'Shop No. 7, Samrthchaya Apartment', 'address', 'Address line 1', 'text', 'Google Maps listing', 1, 90),
  ('address_line2', 'Talegaon Station Rd, near Umang Medical', 'address', 'Address line 2', 'text', 'Google Maps listing', 1, 100),
  ('address_line3', 'Vatan Nagar, Talegaon Dabhade R', 'address', 'Address line 3', 'text', 'Google Maps listing', 1, 110),
  ('address_city', 'Talegaon Dabhade', 'address', 'City', 'text', 'Google Maps listing', 1, 120),
  ('address_region', 'Maharashtra', 'address', 'State / region', 'text', 'Google Maps listing', 1, 130),
  ('address_postal_code', '410507', 'address', 'Postal code', 'text', 'Google Maps listing', 1, 140),
  ('address_country', 'India', 'address', 'Country', 'text', 'Google Maps listing', 1, 150),
  ('address_full', 'Shop No. 7, Samrthchaya Apartment, Talegaon Station Rd, near Umang Medical, Vatan Nagar, Talegaon Dabhade R, Maharashtra 410507', 'address', 'Full address (one line)', 'textarea', 'Google Maps listing', 1, 160),
  ('address_short', 'Talegaon Station Rd, Talegaon Dabhade, Maharashtra 410507', 'address', 'Short address', 'text', 'Google Maps listing', 1, 170),
  ('hours_label', '10:00 AM – 9:30 PM', 'hours', 'Opening hours (display)', 'text', 'Google Maps listing', 1, 180),
  ('hours_days', 'Open all 7 days', 'hours', 'Days open', 'text', 'Google Maps listing', 1, 190),
  ('hours_opens', '10:00', 'hours', 'Opens at (24h)', 'text', 'Google Maps listing', 1, 200),
  ('hours_closes', '21:30', 'hours', 'Closes at (24h)', 'text', 'Google Maps listing', 1, 210),
  ('google_short_url', 'https://maps.app.goo.gl/XwvLKCfxm1MawvcT8', 'location', 'Google Maps short link', 'url', 'Shop brief', 1, 220),
  ('google_place_url', 'https://www.google.com/maps/place/Smart+Phone+Cafe/@18.7333126,73.6780695,17z/data=!4m6!3m5!1s0x3bc2b1935d5671d9:0x96e00ddd4c0a9f23!8m2!3d18.7333126!4d73.6780695!16s%2Fg%2F11dftbwglj', 'location', 'Google Maps place URL', 'url', 'Resolved from the short link', 1, 230),
  ('google_place_id', 'ChIJ2XFWXZOxwjsRI58KTN0N4JY', 'location', 'Google Place ID', 'text', 'Google Maps listing', 1, 240),
  ('google_plus_code', 'PMMH+86 Talegaon Dabhade R, Maharashtra', 'location', 'Plus code', 'text', 'Google Maps listing', 1, 250),
  ('latitude', '18.7333126', 'location', 'Latitude', 'number', 'Google Maps listing', 1, 260),
  ('longitude', '73.6780695', 'location', 'Longitude', 'number', 'Google Maps listing', 1, 270),
  ('listing_description', 'Discover the ultimate mobile experience at Smart Phone Cafe! Whether you''re looking for the latest smartphones, reliable accessories, or expert advice, our friendly team is here to help you find exactly what you need. Enjoy exclusive deals, quick repairs, and personalized service—all in one stop. Visit Smart Phone Cafe today and let us upgrade your digital lifestyle!', 'listing', 'Description published on the Google listing', 'textarea', 'Google Business Profile, quoted verbatim', 1, 280),
  ('service_areas', 'Talegaon Dabhade, Talegaon Station, Vatan Nagar, Vadgaon Maval, Urse, Kamshet, Lonavala, Chakan', 'listing', 'Service areas', 'textarea', 'Nearby localities listed in the shop brief', 1, 290),
  ('site_url', 'https://smartphonecafe.in', 'listing', 'Canonical site URL', 'url', 'Shop brief', 1, 300),
  ('review_count', '324', 'listing', 'Review count (shown on site)', 'number', 'Displayed Google review total; edited by the owner, not computed.', 1, 310),
  ('review_rating', '4.9', 'listing', 'Review rating (shown on site)', 'number', 'Displayed Google aggregate rating; edited by the owner.', 1, 320);


-- ---------------------------------------------------------------------------
-- brands - from frontend/src/data/brands.js
-- ---------------------------------------------------------------------------
-- Brand names only. logo_path stays NULL so the site renders typographic
-- wordmarks: no manufacturer logo is used and no authorised dealership is implied.
-- `category` is the browse grouping from the source file, not a stock claim.

INSERT INTO `brands` (
  `name`,   `slug`,   `note`,   `category`,   `logo_path`,   `is_active`,   `display_order`
) VALUES
  ('Apple', 'apple', 'iPhone', 'premium', NULL, 1, 10),
  ('Samsung', 'samsung', 'Galaxy', 'mainstream', NULL, 1, 20),
  ('Motorola', 'motorola', 'Moto G & Edge', 'mainstream', NULL, 1, 30),
  ('Redmi', 'redmi', 'Note & budget', 'value', NULL, 1, 40),
  ('Realme', 'realme', 'Narzo & number series', 'value', NULL, 1, 50),
  ('Vivo', 'vivo', 'Y & V series', 'mainstream', NULL, 1, 60),
  ('OPPO', 'oppo', 'A & Reno series', 'mainstream', NULL, 1, 70),
  ('POCO', 'poco', 'X, M & C series', 'value', NULL, 1, 80),
  ('Tecno', 'tecno', 'Spark & Camon', 'value', NULL, 1, 90),
  ('Lava', 'lava', 'Blaze & Agni', 'value', NULL, 1, 100);


-- ---------------------------------------------------------------------------
-- smartphones - INTENTIONALLY EMPTY
-- ---------------------------------------------------------------------------
-- The brief forbids inventing prices, stock or model availability, and none has
-- been verified. Rather than seed fabricated rows, the table is left empty;
-- every existing page routes the customer to WhatsApp to ask what is available.
--
-- The four customer-intent groups below are browse prompts from brands.js, not
-- products, so they are not inserted here. They are recorded in
-- homepage_content so the CMS can edit their wording.

-- ---------------------------------------------------------------------------
-- repair_services - from frontend/src/data/repairs.js
-- ---------------------------------------------------------------------------
-- price_from, turnaround_note and warranty_note stay NULL: the listing
-- publishes no service menu, price list or warranty terms, and the site never
-- promises a turnaround. Each row is an issue the shop will assess.

INSERT INTO `repair_services` (
  `slug`,   `title`,   `description`,   `price_from`,   `price_currency`,   `turnaround_note`,   `warranty_note`,   `tags`,   `icon`,   `is_enquiry_only`,   `is_active`,   `display_order`
) VALUES
  ('screen', 'Cracked or broken screen', 'Cracked glass, dead patches, lines across the display or a screen that has stopped responding to touch.', NULL, 'INR', NULL, NULL, 'Display, Touch, Glass', 'screenCrack', 1, 1, 10),
  ('battery', 'Battery draining or swelling', 'A phone that dies quickly, shuts down unexpectedly, heats up while charging or has a swollen back panel.', NULL, 'INR', NULL, NULL, 'Backup, Heating, Swelling', 'battery', 1, 1, 20),
  ('charging', 'Not charging properly', 'Loose or dead charging port, a cable that only works at an angle, or slow and intermittent charging.', NULL, 'INR', NULL, NULL, 'Port, Cable, Slow charge', 'charge', 1, 1, 30),
  ('software', 'Software & performance issues', 'Hanging, restarting on its own, apps crashing, storage full or a phone that will not start up.', NULL, 'INR', NULL, NULL, 'Hanging, Restarting, Startup', 'chip', 1, 1, 40),
  ('water', 'Water or liquid damage', 'Dropped in water or exposed to rain, with the phone switched off or behaving unpredictably afterwards.', NULL, 'INR', NULL, NULL, 'Liquid, Corrosion, Cleaning', 'droplet', 1, 1, 50),
  ('camera', 'Camera problems', 'Blurry photos, a black preview, a cracked lens or a front camera that has stopped working.', NULL, 'INR', NULL, NULL, 'Lens, Focus, Front cam', 'camera', 1, 1, 60),
  ('audio', 'Speaker & microphone faults', 'No sound on calls, distorted audio, a muffled earpiece or callers who cannot hear you.', NULL, 'INR', NULL, NULL, 'Speaker, Mic, Earpiece', 'speaker', 1, 1, 70),
  ('data', 'Data recovery', 'Photos, contacts or files you need back from a phone that has stopped working properly.', NULL, 'INR', NULL, NULL, 'Photos, Contacts, Files', 'shieldCheck', 1, 1, 80);


-- ---------------------------------------------------------------------------
-- accessory_categories - from frontend/src/data/accessories.js
-- ---------------------------------------------------------------------------
-- Supported by the listing's 'Cell phone accessory store' category and the
-- business's own description. Membership is an enquiry topic, never a stock claim.

INSERT INTO `accessory_categories` (
  `slug`,   `title`,   `description`,   `icon`,   `image_path`,   `is_active`,   `display_order`
) VALUES
  ('protection', 'Mobile covers', 'Back covers and protective cases to keep a new handset safe from day one.', 'shield', NULL, 1, 10),
  ('power', 'Chargers & cables', 'Chargers and data cables for the common handsets people bring in every day.', 'charge', NULL, 1, 20),
  ('glass', 'Tempered glass', 'Screen guards and tempered glass, fitted at the counter so it lines up properly.', 'screenCrack', NULL, 1, 30),
  ('audio', 'Earphones & audio', 'Wired and wireless earphones for calls, music and everything in between.', 'headphones', NULL, 1, 40),
  ('backup', 'Power banks', 'Portable backup power for long days, travel and load-shedding hours.', 'battery', NULL, 1, 50),
  ('storage', 'More accessories', 'SIM & memory cards, phone stands, car accessories, cleaning kits and more.', 'chip', NULL, 1, 60);


-- ---------------------------------------------------------------------------
-- accessories - INTENTIONALLY EMPTY
-- ---------------------------------------------------------------------------
-- No accessory product list or price has been published, so no individual
-- accessory rows are seeded. The six categories above carry the content.

-- ---------------------------------------------------------------------------
-- gallery - the nine real store photographs
-- ---------------------------------------------------------------------------
-- Migrated from the generated frontend/src/data/photos.js. Only paths are
-- stored; the image files live on disk under frontend/public/shop-images/.
-- `source_width`/`source_height` record the ORIGINAL pixel size, which is how
-- the 732x660 storefront is known to be too small to render large.

INSERT INTO `gallery` (
  `slug`,   `title`,   `caption`,   `alt_text`,   `image_path`,   `srcset`,   `width`,   `height`,   `aspect_ratio`,   `category`,   `source_width`,   `source_height`,   `is_featured`,   `is_hero`,   `is_active`,   `display_order`
) VALUES
  ('interior', 'Inside the store', 'Inside the store', 'Inside SmartphoneCafe in Talegaon Dabhade: display boards for OPPO, vivo and Samsung Galaxy A14 5G above the counter, with vivo and OPPO posters on the walls', '/shop-images/smartphonecafe-interior-2000.jpg', '/shop-images/smartphonecafe-interior-700.webp 700w, /shop-images/smartphonecafe-interior-1200.webp 1200w, /shop-images/smartphonecafe-interior-2000.webp 2000w', 2000, 1125, '2000 / 1125', 'interior', 4000, 2250, 1, 1, 1, 10),
  ('ownerWithCustomer', 'Owner and customer at the counter', 'Owner and customer at the counter', 'The SmartphoneCafe owner at the counter with a customer, standing beneath OPPO F19 Pro+ and F19 Pro display boards', '/shop-images/smartphonecafe-owner-with-customer-2000.jpg', '/shop-images/smartphonecafe-owner-with-customer-700.webp 700w, /shop-images/smartphonecafe-owner-with-customer-1200.webp 1200w, /shop-images/smartphonecafe-owner-with-customer-2000.webp 2000w', 2000, 900, '2000 / 900', 'store', 4000, 1800, 1, 0, 1, 20),
  ('products', 'Phones and offers on display', 'Phones and offers on display', 'Smartphone promotional boards at SmartphoneCafe showing OPPO A53, A15 and A33, vivo V20 and Y-series models, and Bajaj Finserv easy-EMI offers', '/shop-images/smartphonecafe-products-2000.jpg', '/shop-images/smartphonecafe-products-700.webp 700w, /shop-images/smartphonecafe-products-1200.webp 1200w, /shop-images/smartphonecafe-products-2000.webp 2000w', 2000, 1500, '2000 / 1500', 'smartphones', 4000, 3000, 0, 0, 1, 30),
  ('customerService', 'Serving a customer', 'Serving a customer', 'A customer being served at the SmartphoneCafe counter, with OPPO F19 Pro+, F19 Pro and A54 display boards behind', '/shop-images/smartphonecafe-customer-service-2000.jpg', '/shop-images/smartphonecafe-customer-service-700.webp 700w, /shop-images/smartphonecafe-customer-service-1200.webp 1200w, /shop-images/smartphonecafe-customer-service-2000.webp 2000w', 2000, 947, '2000 / 947', 'store', 4000, 1893, 0, 0, 1, 40),
  ('counterService', 'Helping a customer choose', 'Helping a customer choose', 'The shop owner assisting a customer at the counter, with OPPO display boards on the wall behind', '/shop-images/smartphonecafe-counter-service-2000.jpg', '/shop-images/smartphonecafe-counter-service-700.webp 700w, /shop-images/smartphonecafe-counter-service-1200.webp 1200w, /shop-images/smartphonecafe-counter-service-2000.webp 2000w', 2000, 900, '2000 / 900', 'store', 4000, 1800, 0, 0, 1, 50),
  ('interiorWide', 'Shop interior', 'Shop interior', 'Wide view of the SmartphoneCafe interior, with vivo Y20, Y30 and Y17 display boards along the wall', '/shop-images/smartphonecafe-interior-wide-2000.jpg', '/shop-images/smartphonecafe-interior-wide-700.webp 700w, /shop-images/smartphonecafe-interior-wide-1200.webp 1200w, /shop-images/smartphonecafe-interior-wide-2000.webp 2000w', 2000, 902, '2000 / 902', 'interior', 3264, 1472, 0, 0, 1, 60),
  ('inStoreService', 'In-store service', 'In-store service', 'The shop owner with a customer inside the store, beside a vivo V20 board advertising easy EMIs and 5% cashback', '/shop-images/smartphonecafe-in-store-service-2000.jpg', '/shop-images/smartphonecafe-in-store-service-700.webp 700w, /shop-images/smartphonecafe-in-store-service-1200.webp 1200w, /shop-images/smartphonecafe-in-store-service-2000.webp 2000w', 2000, 1500, '2000 / 1500', 'store', 4000, 3000, 0, 0, 1, 70),
  ('customer', 'A customer with their phone', 'A customer with their phone', 'A customer holding a phone at the SmartphoneCafe store, with an OPPO A55 poster behind', '/shop-images/smartphonecafe-customer-2000.jpg', '/shop-images/smartphonecafe-customer-700.webp 700w, /shop-images/smartphonecafe-customer-1200.webp 1200w, /shop-images/smartphonecafe-customer-2000.webp 2000w', 2000, 2667, '2000 / 2667', 'store', 3000, 4000, 0, 0, 1, 80),
  ('storefront', 'Our shop front on Station Road', 'Our shop front on Station Road', 'The Smart Phone Cafe shop front on Talegaon Station Road, with the signboard name and OPPO branding', '/shop-images/smartphonecafe-storefront-700.jpg', '/shop-images/smartphonecafe-storefront-700.webp 700w', 700, 631, '700 / 631', 'store', 732, 660, 0, 0, 1, 90);


-- ---------------------------------------------------------------------------
-- offers - only source-backed statements, no invented commercial figures
-- ---------------------------------------------------------------------------
-- The shop has published NO verifiable current offers: no discount percentage,
-- no rupee amount, no expiry. discount_label and price_amount are therefore NULL
-- on every row. What IS supported by evidence is:
--   a) the business's own listing description promising 'exclusive deals'
--   b) 'quick repairs' from the same description
--   c) Bajaj Finserv easy-EMI / cashback signage photographed INSIDE the shop
-- (c) is in-store signage, so it is stored as in-store information pending
-- confirmation, flagged needs_confirmation = 1, and must not be presented as a
-- running online promotion. No '20% off' or 'Rs 499' style figure is invented.

INSERT INTO `offers` (
  `title`,   `subtitle`,   `description`,   `discount_label`,   `price_amount`,   `price_currency`,   `badge`,   `image_path`,   `cta_label`,   `cta_url`,   `starts_on`,   `ends_on`,   `is_active`,   `is_featured`,   `needs_confirmation`,   `source_note`,   `display_order`
) VALUES
  ('Ask about current deals', 'Exclusive deals advertised in store', 'The business''s own Google listing description states ''Enjoy exclusive deals, quick repairs, and personalized service - all in one stop.'' Stock and pricing change often, so message the store to hear what is running right now.', NULL, NULL, 'INR', 'Enquiry', NULL, 'Message us', 'https://wa.me/919922599577', NULL, NULL, 1, 1, 1, 'Google Business Profile description, quoted verbatim', 10),
  ('Easy EMIs available in store', 'Instalment options discussed at the counter', 'EMI and cashback signage is displayed inside the shop (including Bajaj Finserv). Exact schemes, eligibility and rates are set by the finance provider and are not published online - ask at the counter for the current terms.', NULL, NULL, 'INR', 'In store', NULL, 'Ask in store', 'https://wa.me/919922599577', NULL, NULL, 1, 0, 1, 'In-store signage photographed at the shop - in-store information, not an online promotion', 20),
  ('Quick repairs, checked at the counter', 'Faults assessed before any work starts', 'The shop is a dedicated mobile phone repair shop. Bring the phone in and the fault is checked in front of you; no work begins until you agree. The listing promises ''quick repairs'' but states no timeframe, so no turnaround is promised here.', NULL, NULL, 'INR', 'Service', NULL, 'WhatsApp your problem', 'https://wa.me/919922599577', NULL, NULL, 1, 0, 1, 'Google Business Profile description and categories', 30);


-- ---------------------------------------------------------------------------
-- homepage_content - section copy, migrated from the existing live pages
-- ---------------------------------------------------------------------------
-- Every heading and paragraph below already renders on the built site, taken
-- from Hero.jsx, Home.jsx, CtaBand.jsx and SectionHeading props. Nothing is new
-- copy and nothing is placeholder text.

INSERT INTO `homepage_content` (
  `section_key`,   `eyebrow`,   `heading`,   `subheading`,   `body`,   `cta_label`,   `cta_url`,   `image_path`,   `is_visible`,   `display_order`
) VALUES
  ('hero', 'Smartphones · Repairs · Accessories', 'Your next phone. Your local repair shop.', NULL, 'SmartphoneCafe sits on Talegaon Station Road. Come in to compare handsets, pick up the essentials, or have a fault looked at the counter.', 'Explore Smartphones', '/smartphones', '/shop-images/smartphonecafe-interior-2000.jpg', 1, 10),
  ('about', 'Who we are', 'A phone shop you can walk into', NULL, 'SmartphoneCafe sells smartphones and repairs them. The store is on Talegaon Station Road near Umang Medical - an easy stop whether you are buying a new handset, replacing a cracked screen or picking up a charger on the way home.', 'More about the store', '/about', '/shop-images/smartphonecafe-owner-with-customer-2000.jpg', 1, 20),
  ('smartphones', 'Smartphones', 'Find the right phone, not just any phone', 'Tell us your budget and how you use your phone. We will show you what fits - and what is actually available today.', NULL, NULL, NULL, '/shop-images/smartphonecafe-products-2000.jpg', 1, 30),
  ('repairs', 'Repairs', 'Something wrong with your phone?', 'We are a dedicated mobile phone repair shop. Bring the phone in and the fault is checked at the counter before anything goes ahead.', NULL, 'See repair services', '/repairs', '/shop-images/smartphonecafe-counter-service-2000.jpg', 1, 40),
  ('brands', 'Brands', 'The brands people come in asking for', 'Tap any brand to start a WhatsApp enquiry. This is the list of brands we are asked about most - it is not a stock list, so we will confirm what is in store when you message.', NULL, NULL, NULL, NULL, 1, 50),
  ('accessories', 'Accessories', 'The small things that keep a phone usable', 'Covers, screen protection, chargers, earphones and power banks - the everyday items you end up needing the same day.', NULL, 'Ask what is in stock', NULL, NULL, 1, 60),
  ('gallery', 'Gallery', 'A look inside the store', 'Real photographs of SmartphoneCafe - the counter, the displays and the people behind it. Photographed in the shop, not borrowed from a stock library.', NULL, 'Open gallery', '/gallery', '/shop-images/smartphonecafe-interior-wide-2000.jpg', 1, 70),
  ('visit', 'Find the store', 'On Talegaon Station Road, easy to reach.', NULL, 'We are on the main Station Road stretch near Umang Medical - a short walk from Talegaon station and easy to pull up to on a two-wheeler.', 'Get Directions', 'https://maps.app.goo.gl/XwvLKCfxm1MawvcT8', NULL, 1, 80),
  ('cta', 'Ready when you are', 'Message the store and get an answer today.', NULL, 'Ask about a phone, check a price or describe a fault. We reply on WhatsApp during shop hours, every day of the week.', 'WhatsApp Us', 'https://wa.me/919922599577', NULL, 1, 90);


-- ---------------------------------------------------------------------------
-- reviews - verified customer reviews from the Google Business Profile
-- ---------------------------------------------------------------------------
-- Transcribed exactly as published. No review, name or star value is invented.

INSERT INTO `reviews` (
  `reviewer_name`,   `review_text`,   `rating`,   `is_active`,   `display_order`
) VALUES
  ('Sampat Shinde', 'This shop really impressed me with their selection and financing options. They had a wide range of brands like Oppo, Vivo, Samsung, iPhone, Realme, Motorola, and Nokia, which made it easy to find exactly what I was looking for. Plus, they …', 5, 1, 0),
  ('Shivaji Ghardale', 'I recently visited this mobile shop, and I have to say, I was really impressed! The owner was super friendly and took the time to help me find exactly what I needed, all at very reasonable prices. It’s definitely my go-to place for anything mobile!', 5, 1, 10),
  ('Sujata Jadhav', 'Very fast service, change my mobile display touch glass in one hour, rate are very reasonable, recommended for mobile repair.', 5, 1, 20),
  ('Jijaram Kaldoke', 'Very nice service and cooperative staff, good product rang also repair service available here, must visit for any mobile phone related problem.', 5, 1, 30),
  ('Alom Hoque', 'Very good service, Repair my OnePlus mobile here, rate are very reasonable, mobile wrap also available here, recommended for your all mobile needs, keep it up 😊 …', 5, 1, 40),
  ('Pappu', 'Good Shop, fast service and owner is also very cooperative.', 5, 1, 50);


-- ---------------------------------------------------------------------------
-- Deliberately not seeded
-- ---------------------------------------------------------------------------
--  smartphones        no verified model list, price or stock exists
--  accessories        no verified product list or price exists
--  users              the first admin is created by the operator, so no
--                     default credential can leak into the repository
--  budget_bands /     these are browse prompts rather than records; their
--  smartphone_        wording is already carried in homepage_content and
--  categories         brands.js remains the source for the public site
-- Total placed offers, prices and discounts: zero, because none is verified.
-- ---------------------------------------------------------------------------
