#!/bin/bash

set -e

mkdir -p output/
mkdir -p output/geojson
rm -rf output/geojson/*

while read p; do
  OUTNAME="./output/geojson/$p.geojson"

  echo "Writing $p to $OUTNAME..."

  ogr2ogr \
  -where "iso_code='$p'" \
  -select "iso_code","region","GDLcode" \
  -f GeoJSON $OUTNAME \
  "GDL Shapefiles V4/GDL Shapefiles V4.shp" 
done < isos.txt