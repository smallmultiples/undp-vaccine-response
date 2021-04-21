## Providing country data

The data should be provided as a JSON array of objects, where each object contains the required fields (listed below) as well as any data. Each object is for a single country, at a single point in time.

### Required fields

-   `Country or Area`
    -   The name of the country
-   `Alpha-3 code`
    -   ISO 3166 alpha-3 country code
-   `Year`
    -   The data in excel format (i.e. days since 1/1/1990, as a number)

### Data fields

Any number of fields can be added, with no strict requirement on column names.

### Reducing file size

-   You may omit the field in objects where the value is null/missing
-   Remove unused columns (e.g. flags, regions, )
-   Only include country data (e.g. Jurisdiction = 'NAT_TOTAL')
