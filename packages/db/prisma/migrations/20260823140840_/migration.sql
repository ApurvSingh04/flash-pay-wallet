/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `MerchantTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `p2pTransfer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MerchantTransaction" ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "p2pTransfer" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MerchantTransaction_idempotencyKey_key" ON "MerchantTransaction"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "p2pTransfer_idempotencyKey_key" ON "p2pTransfer"("idempotencyKey");
