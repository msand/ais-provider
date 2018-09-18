
CREATE TABLE ais (
  id BIGSERIAL,
  received_date TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  mmsi INT,
  navigation_status SMALLINT,
  rate_of_turn NUMERIC(6,3),
  speed_over_ground NUMERIC(6,3),
  position_accuracy BOOLEAN,
  longitude NUMERIC(9, 6),
  latitude NUMERIC(9, 6),
  course_over_ground NUMERIC(6,3),
  true_heading NUMERIC(6,3),
  maneuver CHARACTER VARYING,

  imo INT,
  callsign CHARACTER VARYING,
  vessel_name CHARACTER VARYING,
  vessel_type CHARACTER VARYING,
  dimension_to_bow INT,
  dimension_to_stern INT,
  dimension_to_starboard INT,
  dimension_to_port INT,
  destination CHARACTER VARYING,
  eta CHARACTER VARYING,
  draft NUMERIC(4,1),
  device CHARACTER VARYING,
  
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);