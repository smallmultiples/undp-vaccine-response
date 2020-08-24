# Embedding UNDP data platform visualisations

## Script + style tags

In the `<head>`
`<link href="https://undp-covid.visualise.today/static/css/main.css" rel="stylesheet">`

And end of `<body>`
`<script src="https://undp-covid.visualise.today/static/js/main.js"></script>`

All visualisations automatically embed themselves into a div with a specific data-attribute on page load, inferring the required configuration from the URL. The configuration is logged at load (for now) to help debug.

## Available Embeds

Pillar/Bucket - world map with accompanying charts and timeline
Country - subnational map with accompanying visualisations

Currently the embed selected is based on the URL. (See rules below)

## Pillar/Bucket

Pages must follow one of these patterns

-   `/undps-response/:pillarSlug/:bucketSlug`
-   `/undps-response/:pillarSlug/:bucketSlug?country=:countrySlug`
-   `/undps-response/:pillarSlug`
-   `/undps-response/:pillarSlug?country=:countrySlug`

On window event `DOMContentLoaded` the embed will initialize itself into the first element with the attribute `data-bucket-embed` e.g. `<div id="root" data-bucket-embed></div>`

The embed will automatically adjust the displayed content depending on the URL structure.

## Country embed

Pages must follow this pattern - `/country/:countrySlug`
On window event `DOMContentLoaded` the embed will initialize itself into the first element with the attribute `data-country-embed` e.g. `<div id="root" data-country-embed></div>`
