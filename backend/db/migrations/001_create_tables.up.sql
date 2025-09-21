-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fragrances table
CREATE TABLE fragrances (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT REFERENCES brands(id),
  name TEXT NOT NULL,
  description TEXT,
  scent_family TEXT,
  top_notes TEXT,
  middle_notes TEXT,
  base_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decant sizes table
CREATE TABLE decant_sizes (
  id BIGSERIAL PRIMARY KEY,
  size_ml INTEGER UNIQUE NOT NULL,
  label TEXT NOT NULL
);

-- Fragrance decant prices table
CREATE TABLE fragrance_decant_prices (
  id BIGSERIAL PRIMARY KEY,
  fragrance_id BIGINT REFERENCES fragrances(id),
  decant_size_id BIGINT REFERENCES decant_sizes(id),
  price DOUBLE PRECISION NOT NULL,
  UNIQUE(fragrance_id, decant_size_id)
);

-- Cart items table
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  fragrance_id BIGINT REFERENCES fragrances(id),
  decant_size_id BIGINT REFERENCES decant_sizes(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fragrance_id, decant_size_id)
);

-- Orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  total_amount DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  fragrance_id BIGINT REFERENCES fragrances(id),
  decant_size_id BIGINT REFERENCES decant_sizes(id),
  quantity INTEGER NOT NULL,
  price_per_item DOUBLE PRECISION NOT NULL
);

-- Insert default decant sizes
INSERT INTO decant_sizes (size_ml, label) VALUES
(2, '2ml Sample'),
(5, '5ml Travel'),
(10, '10ml Decant');

-- Insert sample brands
INSERT INTO brands (name, description) VALUES
('Tom Ford', 'Luxury American fashion house known for sophisticated fragrances'),
('Creed', 'Historic perfume house established in 1760, crafting artisanal fragrances'),
('Maison Francis Kurkdjian', 'Contemporary French perfume house known for modern luxury'),
('Le Labo', 'Artisanal perfume house focusing on fresh, handcrafted fragrances'),
('Byredo', 'Swedish luxury brand known for modern, minimalist scents');

-- Insert sample fragrances
INSERT INTO fragrances (brand_id, name, description, scent_family, top_notes, middle_notes, base_notes, image_url) VALUES
(1, 'Oud Wood', 'A rare, exotic and smoky blend featuring oud wood from the finest sources', 'Oriental Woody', 'Brazilian Rosewood, Chinese Pepper', 'Oud Wood, Sandalwood', 'Vanilla, Amber'),
(1, 'Tobacco Vanille', 'A sophisticated blend of sweet and spicy tobacco leaves', 'Oriental Spicy', 'Tobacco Leaf, Spicy Notes', 'Vanilla, Cocoa', 'Dried Fruits, Woody Notes'),
(2, 'Aventus', 'A sophisticated scent perfect for the successful, ambitious and dynamic man', 'Chypre Fruity', 'Blackcurrant, Apple, Pineapple', 'Patchouli, Moroccan Rose', 'Musk, Oak Moss, Ambergris'),
(3, 'Baccarat Rouge 540', 'A poetic alchemy between jasmine flowers and saffron spice', 'Amber Floral', 'Saffron, Jasmine', 'Amberwood, Ambergris', 'Fir Resin, Cedar'),
(4, 'Santal 33', 'A smoky-rose scent that has become a cult classic', 'Woody Aromatic', 'Violet, Cardamom', 'Iris, Ambrox', 'Sandalwood, Cedarwood'),
(5, 'Gypsy Water', 'A fresh take on the classic eau de cologne with a bohemian spirit', 'Woody Aromatic', 'Bergamot, Pepper, Juniper', 'Incense, Pine Needles', 'Vanilla, Sandalwood');

-- Insert fragrance prices
INSERT INTO fragrance_decant_prices (fragrance_id, decant_size_id, price) VALUES
-- Tom Ford Oud Wood
(1, 1, 12.00), (1, 2, 28.00), (1, 3, 55.00),
-- Tom Ford Tobacco Vanille
(2, 1, 12.00), (2, 2, 28.00), (2, 3, 55.00),
-- Creed Aventus
(3, 1, 15.00), (3, 2, 35.00), (3, 3, 68.00),
-- MFK Baccarat Rouge 540
(4, 1, 18.00), (4, 2, 42.00), (4, 3, 82.00),
-- Le Labo Santal 33
(5, 1, 14.00), (5, 2, 32.00), (5, 3, 62.00),
-- Byredo Gypsy Water
(6, 1, 13.00), (6, 2, 30.00), (6, 3, 58.00);
