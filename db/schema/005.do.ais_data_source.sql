
ALTER TABLE ais DROP CONSTRAINT IF EXISTS ais_unique_vessel_entry;
ALTER TABLE ais ADD COLUMN IF NOT EXISTS data_source CHARACTER VARYING NOT NULL DEFAULT 'aishub';
CREATE INDEX ais_data_source_idx ON ais(data_source);
ALTER TABLE ais ADD CONSTRAINT ais_unique_vessel_entry UNIQUE(mmsi, generated_date, data_source);