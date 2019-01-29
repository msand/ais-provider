
ALTER TABLE ais DROP CONSTRAINT IF EXISTS ais_unique_vessel_entry;
ALTER TABLE ais DROP COLUMN IF EXISTS data_source;
ALTER TABLE ais ADD CONSTRAINT ais_unique_vessel_entry UNIQUE(mmsi, generated_date);