#!/bin/bash

set -e

rm -r output
mkdir -p output/

while read p; do
  OUTNAME="./output/$p.geojson"

  echo "Writing $p to $OUTNAME..."

  ogr2ogr \
  -where "iso_code='$p'" \
  -select "iso_code","region","GDLcode","shdi" \
  -f GeoJSON $OUTNAME \
  "GDL Shapefiles V4/GDL Shapefiles V4.shp" 
done < isos.txt