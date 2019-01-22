CREATE TABLE vessels (
  id SERIAL PRIMARY KEY,
  imo INTEGER,
  name CHARACTER VARYING NOT NULL,
  mmsi INTEGER,
  flag CHARACTER VARYING,
  length NUMERIC(9,2),
  beam NUMERIC(9,2),
  dimension_to_bow INTEGER,
  dimension_to_stern INTEGER,
  dimension_to_starboard INTEGER,
  dimension_to_port INTEGER,
  type CHARACTER VARYING,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vessels_name_idx ON vessels (name);
CREATE INDEX IF NOT EXISTS vessels_imo_idx ON vessels (imo);
CREATE UNIQUE INDEX IF NOT EXISTS vessels_mmsi_idx ON vessels (mmsi);

CREATE TABLE terminals (
  id SERIAL PRIMARY KEY,
  un_locode CHARACTER VARYING NOT NULL,
  name CHARACTER VARYING NOT NULL
);
CREATE INDEX IF NOT EXISTS terminals_name_idx ON terminals (name);
CREATE INDEX IF NOT EXISTS terminals_un_locode_idx ON terminals (un_locode);
CREATE UNIQUE INDEX IF NOT EXISTS terminals_un_locode_name_idx ON terminals (un_locode, name);

CREATE TABLE port_calls (
  id BIGSERIAL PRIMARY KEY,
  data_source_name CHARACTER VARYING NOT NULL,
  un_locode CHARACTER VARYING NOT NULL,
  arrival TIMESTAMPTZ,
  departure TIMESTAMPTZ,
  draft_arrival NUMERIC(6,2),
  draft_departure NUMERIC(6,2),
  terminal_id INTEGER REFERENCES terminals(id),
  vessel_id INTEGER NOT NULL REFERENCES vessels(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS port_calls_vessel_id_terminal_id_arrival_departure_idx ON port_calls (vessel_id, terminal_id, arrival, departure);
CREATE INDEX IF NOT EXISTS port_calls_vessel_id_idx ON port_calls (vessel_id);
CREATE INDEX IF NOT EXISTS port_calls_terminal_id_idx ON port_calls (terminal_id);
CREATE INDEX IF NOT EXISTS port_calls_un_locode_idx ON port_calls (un_locode);
CREATE INDEX IF NOT EXISTS port_calls_arrival_departure_idx ON port_calls (arrival, departure);
CREATE INDEX IF NOT EXISTS port_calls_un_locode_arrival_departure_idx ON port_calls (un_locode, arrival, departure);
CREATE INDEX IF NOT EXISTS port_calls_un_locode_departure_arrival_idx ON port_calls (un_locode, departure, arrival);
CREATE INDEX IF NOT EXISTS port_calls_terminal_id_arrival_departure_idx ON port_calls (terminal_id, arrival, departure);
CREATE INDEX IF NOT EXISTS port_calls_terminal_id_departure_arrival_idx ON port_calls (terminal_id, departure, arrival);