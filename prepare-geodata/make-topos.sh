#!/bin/bash

set -e

mkdir -p output/topojson
rm -rf ./output/topojson/*

while read p; do
  INNAME="./output/geojson/$p.geojson"
  OUTNAME="./output/topojson/$p.topojson"

  echo "Making topo for $p. Writing to $OUTNAME..."

  geo2topo $INNAME | toposimplify -o $OUTNAME -P 0.05

done < isos.txt