DELETE FROM ais;
ALTER TABLE ais ADD CONSTRAINT ais_unique_vessel_entry UNIQUE(mmsi, generated_date);