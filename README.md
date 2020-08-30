## Building the app

-   To build the application, cd into `react-frontend` and run `build.sh`. This script fetches the latest data and stores in static json files, and then builds the frontend by compiling and bundling javascript and css.
-   The output is a static file structure in `react-frontend/build`


### Current bucket embeds

Are generate using the config under `indicators-phase2` https://docs.google.com/spreadsheets/d/1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs/edit#gid=51131718

- http://localhost:3000/undps-response/health-first/respond
- http://localhost:3000/undps-response/health-first/maintain
- http://localhost:3000/undps-response/health-first/recovery
- http://localhost:3000/undps-response/protect-people/vulnerable-populations
- http://localhost:3000/undps-response/protect-people/immediate-action
- http://localhost:3000/undps-response/protect-people/long-term-action
- http://localhost:3000/undps-response/economic-recovery/vulnerable-groups
- http://localhost:3000/undps-response/economic-recovery/impact
- http://localhost:3000/undps-response/economic-recovery/adaptation
- http://localhost:3000/undps-response/macro-response/challenges
- http://localhost:3000/undps-response/macro-response/partnerships
- http://localhost:3000/undps-response/macro-response/opportunities
- http://localhost:3000/undps-response/social-cohesion/gov-citizen
- http://localhost:3000/undps-response/social-cohesion/citizen-gov
- http://localhost:3000/undps-response/social-cohesion/citizen-citizen

### Current country embeds

Are generate using the config under `regions` at https://docs.google.com/spreadsheets/d/1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs/edit#gid=357676791 eg:

- http://localhost:3000/country/nepal