-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "shipping_fee" INTEGER NOT NULL DEFAULT 79,
    "free_shipping_above" INTEGER DEFAULT 999,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
