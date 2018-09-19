CREATE INDEX IF NOT EXISTS ais_imo_idx ON ais USING HASH (imo);
CREATE INDEX IF NOT EXISTS ais_mmsi_idx ON ais USING HASH (mmsi);
CREATE INDEX IF NOT EXISTS ais_vessel_name_idx ON ais USING HASH(vessel_name);
CREATE INDEX IF NOT EXISTS ais_generated_date_idx ON ais (generated_date);
CREATE INDEX IF NOT EXISTS ais_longitude_idx ON ais (longitude);
CREATE INDEX IF NOT EXISTS ais_latitude_idx ON ais (latitude);
CREATE INDEX IF NOT EXISTS ais_longitude_latitude_idx ON ais (longitude, latitude);