
SELECT un_locode, hapag_priority, latitude, longitude FROM port_locations WHERE hapag_priority > 0 ORDER BY hapag_priority, un_locode LIMIT 2000;