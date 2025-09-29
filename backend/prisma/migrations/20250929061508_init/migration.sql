-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fragrances" (
    "id" BIGSERIAL NOT NULL,
    "brand_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scent_family" TEXT,
    "top_notes" TEXT,
    "middle_notes" TEXT,
    "base_notes" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fragrances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."decant_sizes" (
    "id" BIGSERIAL NOT NULL,
    "size_ml" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "decant_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fragrance_decant_prices" (
    "id" BIGSERIAL NOT NULL,
    "fragrance_id" BIGINT NOT NULL,
    "decant_size_id" BIGINT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fragrance_decant_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "fragrance_id" BIGINT NOT NULL,
    "decant_size_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "fragrance_id" BIGINT NOT NULL,
    "decant_size_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_item" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "public"."brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "decant_sizes_size_ml_key" ON "public"."decant_sizes"("size_ml");

-- CreateIndex
CREATE UNIQUE INDEX "fragrance_decant_prices_fragrance_id_decant_size_id_key" ON "public"."fragrance_decant_prices"("fragrance_id", "decant_size_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_fragrance_id_decant_size_id_key" ON "public"."cart_items"("user_id", "fragrance_id", "decant_size_id");

-- AddForeignKey
ALTER TABLE "public"."fragrances" ADD CONSTRAINT "fragrances_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fragrance_decant_prices" ADD CONSTRAINT "fragrance_decant_prices_fragrance_id_fkey" FOREIGN KEY ("fragrance_id") REFERENCES "public"."fragrances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fragrance_decant_prices" ADD CONSTRAINT "fragrance_decant_prices_decant_size_id_fkey" FOREIGN KEY ("decant_size_id") REFERENCES "public"."decant_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_fragrance_id_fkey" FOREIGN KEY ("fragrance_id") REFERENCES "public"."fragrances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_decant_size_id_fkey" FOREIGN KEY ("decant_size_id") REFERENCES "public"."decant_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_fragrance_id_fkey" FOREIGN KEY ("fragrance_id") REFERENCES "public"."fragrances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_decant_size_id_fkey" FOREIGN KEY ("decant_size_id") REFERENCES "public"."decant_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
