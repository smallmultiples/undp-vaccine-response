# Embedding UNDP data platform visualisations

## Script + style tags

In the `<head>`
`<link href="https://undp-vaccine-equity.netlify.app/static/css/main.css" rel="stylesheet">`

And end of `<body>`
`<script src="https://undp-vaccine-equity.netlify.app/static/js/main.js"></script>`

All visualisations automatically embed themselves into a div with a specific data-attribute on page load, inferring the required configuration from the URL. The configuration is logged at load (for now) to help debug.

## Available Embeds

Pillar/Bucket - world map with accompanying charts and timeline
Bucket Indicator Table - table with source information for all indicators in the bucket

Currently the embed selected is based on the URL. (See rules below)

## Pillar/Bucket

Pages must follow this pattern - `/vaccine-equality/:bucketSlug`

On window event `DOMContentLoaded` the embed will initialize itself into the first element with the attribute `data-bucket-embed` e.g. `<div id="root" data-bucket-embed></div>`

The embed will automatically adjust the displayed content depending on the URL structure.

In addition to this, the _bucket indicator table_ will attempt to load into the first element with the attribute `data-bucket-table-embed` e.g. `<div data-bucket-table-embed></div>`