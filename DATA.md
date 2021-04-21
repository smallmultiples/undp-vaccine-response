The existing format of the data is close to being compatible, it needs just a few minor tweaks.

-   `CountryName` should be named `Country or Area`
    -   The name of the country
    -   `location` and `continent` are redundant
-   `CountryCode` should be named `Alpha-3 code`
    -   ISO 3166 alpha-3 country code
    -   `iso_code` is redundant
-   Data timestamp is `Year`
    -   There are multiple date columns - please make sure at least one is provided as `date`
        -   `date`, `date2`, `Date`
    -   The date is in _excel format_ (i.e. days since 1/1/1990, as a number)
    -   This is an artefact of how the prototype was built. If this is difficult to provide, a consistent date format can be supported.
-   Only include country data (e.g. Jurisdiction = 'NAT_TOTAL'). There should be one row per country, per date.
-   Please ensure that numerical data is provided as numbers, not as strings
    -   e.g. `"life_expectancy":"83.73"` should instead be `"life_expectancy":83.73`
    -   you can provide any precision, formatting is handled in configuration.
-   You may omit the field in objects where the value is null/missing
-   Remove unused columns (e.g. flags, regions, columns used for calculation)
-   Remove empty rows
