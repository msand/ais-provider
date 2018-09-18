WITH args AS (
  SELECT
    $1::INTEGER AS mmsi,
    $2::TIMESTAMP AS received_date,
    $3::TIMESTAMP AS generated_date,
    
    $4::SMALLINT AS navigation_status,
    $5::NUMERIC(6,3) AS rate_of_turn,
    $6::NUMERIC(6,3) AS speed_over_ground,
    $7::BOOLEAN AS position_accuracy,
    $8::NUMERIC(10,6) AS longitude,
    $9::NUMERIC(10,6) AS latitude,
    $10::NUMERIC(6,3) AS course_over_ground,
    $11::NUMERIC(6,3) AS true_heading,
    $12::CHARACTER VARYING AS maneuver,

    $13::INTEGER AS imo,
    $14::CHARACTER VARYING AS callsign,
    $15::CHARACTER VARYING AS vessel_name,
    $16::CHARACTER VARYING AS vessel_type,
    $17::INTEGER AS dimension_to_bow,
    $18::INTEGER AS dimension_to_stern,
    $19::INTEGER AS dimension_to_starboard,
    $20::INTEGER AS dimension_to_port,
    $21::CHARACTER VARYING AS destination,
    $22::CHARACTER VARYING AS eta,
    $23::NUMERIC(4,1) AS draft,
    $24::CHARACTER VARYING AS device
)
INSERT INTO ais (
  mmsi,
  received_date,
  generated_date,
  
  navigation_status,
  rate_of_turn,
  speed_over_ground,
  position_accuracy,
  longitude,
  latitude,
  course_over_ground,
  true_heading,
  maneuver,

  imo,
  callsign,
  vessel_name,
  vessel_type,
  dimension_to_bow,
  dimension_to_stern,
  dimension_to_starboard,
  dimension_to_port,
  destination,
  eta,
  draft,
  device
) (
  SELECT 
    mmsi,
    received_date,
    generated_date,
  
    navigation_status,
    rate_of_turn,
    speed_over_ground,
    position_accuracy,
    longitude,
    latitude,
    course_over_ground,
    true_heading,
    maneuver,

    imo,
    callsign,
    vessel_name,
    vessel_type,
    dimension_to_bow,
    dimension_to_stern,
    dimension_to_starboard,
    dimension_to_port,
    destination,
    eta,
    draft,
    device
  FROM args
)
