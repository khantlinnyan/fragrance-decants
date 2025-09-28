-- Add address fields to users table for future account creation
ALTER TABLE users ADD COLUMN address_line1 TEXT;
ALTER TABLE users ADD COLUMN address_line2 TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN state_province TEXT;
ALTER TABLE users ADD COLUMN postal_code TEXT;
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;

-- Create guest_orders table for temporary order storage
CREATE TABLE guest_orders (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  total_amount DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending',
  save_details_for_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guest_order_items table
CREATE TABLE guest_order_items (
  id BIGSERIAL PRIMARY KEY,
  guest_order_id BIGINT REFERENCES guest_orders(id) ON DELETE CASCADE,
  fragrance_id BIGINT REFERENCES fragrances(id),
  decant_size_id BIGINT REFERENCES decant_sizes(id),
  quantity INTEGER NOT NULL,
  price_per_item DOUBLE PRECISION NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_guest_orders_session_id ON guest_orders(session_id);
CREATE INDEX idx_guest_orders_email ON guest_orders(email);
CREATE INDEX idx_guest_orders_status ON guest_orders(status);
CREATE INDEX idx_guest_order_items_guest_order_id ON guest_order_items(guest_order_id);

-- Create cart_sessions table for guest cart management
CREATE TABLE cart_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guest_cart_items table
CREATE TABLE guest_cart_items (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  fragrance_id BIGINT REFERENCES fragrances(id),
  decant_size_id BIGINT REFERENCES decant_sizes(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, fragrance_id, decant_size_id)
);

-- Add indexes for guest cart
CREATE INDEX idx_guest_cart_items_session_id ON guest_cart_items(session_id);