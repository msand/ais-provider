-- $1: IMO
-- $2: data source
-- $3: un_locode
-- $4: from
-- $5: to

SELECT * FROM ais
WHERE CASE WHEN $1::INTEGER IS NOT NULL THEN imo = $1::INTEGER ELSE TRUE END
  AND CASE WHEN $2::TEXT IS NOT NULL THEN data_source = $2::TEXT ELSE TRUE END
  AND CASE WHEN $3::TEXT IS NOT NULL THEN 
    latitude BETWEEN (SELECT latitude - 0.1 FROM port_locations WHERE un_locode = $3::TEXT) AND (SELECT latitude + 0.1 FROM port_locations WHERE un_locode = $3::TEXT)
    AND
    longitude BETWEEN (SELECT longitude - 0.1 FROM port_locations WHERE un_locode = $3::TEXT) AND (SELECT longitude + 0.1 FROM port_locations WHERE un_locode = $3::TEXT)
  ELSE TRUE END
  AND generated_date BETWEEN $4::TIMESTAMPTZ AND $5::TIMESTAMPTZ
ORDER BY generated_date DESC
LIMIT 10000