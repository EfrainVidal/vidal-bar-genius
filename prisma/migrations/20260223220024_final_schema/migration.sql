-- CreateIndex
CREATE INDEX "StripeEvent_receivedAt_idx" ON "StripeEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "StripeEvent_processedAt_idx" ON "StripeEvent"("processedAt");

-- CreateIndex
CREATE INDEX "StripeEvent_type_idx" ON "StripeEvent"("type");

-- CreateIndex
CREATE INDEX "User_isPro_idx" ON "User"("isPro");
