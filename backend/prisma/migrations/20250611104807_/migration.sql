-- CreateIndex
CREATE INDEX "idx_contracts_multiplier_status" ON "contracts"("multiplierId", "status");

-- CreateIndex
CREATE INDEX "idx_multipliers_status_active" ON "multipliers"("status", "isActive");

-- CreateIndex
CREATE INDEX "idx_parcels_multiplier_status" ON "parcels"("multiplierId", "status");

-- CreateIndex
CREATE INDEX "idx_previous_crops_parcel_year" ON "previous_crops"("parcelId", "year");

-- CreateIndex
CREATE INDEX "idx_production_activities_prod_date" ON "production_activities"("productionId", "activityDate");

-- CreateIndex
CREATE INDEX "idx_production_history_multiplier_year" ON "production_history"("multiplierId", "year");

-- CreateIndex
CREATE INDEX "idx_production_issues_prod_resolved" ON "production_issues"("productionId", "resolved");

-- CreateIndex
CREATE INDEX "idx_productions_multiplier_status" ON "productions"("multiplierId", "status");

-- CreateIndex
CREATE INDEX "idx_quality_controls_lot_date" ON "quality_controls"("lotId", "controlDate");

-- CreateIndex
CREATE INDEX "idx_quality_controls_result_date" ON "quality_controls"("result", "controlDate");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_expiry" ON "refresh_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_token_expiry" ON "refresh_tokens"("token", "expiresAt");

-- CreateIndex
CREATE INDEX "idx_reports_type_created" ON "reports"("type", "createdAt");

-- CreateIndex
CREATE INDEX "idx_seed_lots_expiry_status" ON "seed_lots"("expiryDate", "status");

-- CreateIndex
CREATE INDEX "idx_soil_analyses_parcel_date" ON "soil_analyses"("parcelId", "analysisDate");

-- CreateIndex
CREATE INDEX "idx_users_role_active" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "idx_varieties_crop_active" ON "varieties"("cropType", "isActive");

-- CreateIndex
CREATE INDEX "idx_weather_data_prod_date" ON "weather_data"("productionId", "recordDate");
