#!/usr/bin/env python

import csv, re
from subprocess import call

infile = '../data/out/test01-small.csv'
db = 'ddmeoeu1ft4ogs'
table = 'test'
host = 'ec2-54-165-36-134.compute-1.amazonaws.com'
user = 'avccdvxitxgyvc'
pwd = '20ce9a7b40fd4c80853c3419a1da001d5dfddb41f94855d0296b65e01332081c'
port = '5432'

fh = csv.reader(open(infile, 'r'), delimiter=',', quotechar='"')
headers = next(fh)

def variablize(text, prefix=''):
    if not prefix:
        # if no prefix, move any digits or non-word chars to the end
        parts = re.match('(^[\W\d]*)(.*$)', text).groups()
        text = "%s %s" % (parts[1], parts[0])
    text = ("%s %s" % (prefix, text)).strip().lower()
    text =  re.sub('[\W]', '_', text)
    return re.sub('_*$', '', text)

columns = map(variablize, open(infile).readline().split(','))
columns = map(lambda v: '%s varchar(128)' % v, columns)
queries = [
    'drop table %s;' % table,
    'create table %s (%s);' % (table, ','.join(columns)),
    "copy %s from '%s' with csv header;" % (table, infile),
    'alter table %s add column id serial;' % table,
    'alter table %s add primary key (id);' % table,
]
for q in queries:
    call(['psql','-a','-h', host, '-U', user, '-W', pwd, '-p', port, '-d',db,'-c',q])

# create table test (country varchar(128),year varchar(128),human_development_index varchar(128),iso_code varchar(128),location varchar(128),date varchar(128),total_cases varchar(128),new_cases varchar(128),total_deaths varchar(128),new_deaths varchar(128),total_cases_per_million varchar(128),new_cases_per_million varchar(128),total_deaths_per_million varchar(128),new_deaths_per_million varchar(128),total_tests varchar(128),new_tests varchar(128),total_tests_per_thousand varchar(128),new_tests_per_thousand varchar(128),new_tests_smoothed varchar(128),new_tests_smoothed_per_thousand varchar(128),tests_units varchar(128),stringency_index varchar(128),population varchar(128),population_density varchar(128),median_age varchar(128),aged_65_older varchar(128),aged_70_older varchar(128),gdp_per_capita varchar(128),extreme_poverty varchar(128),cvd_death_rate varchar(128),diabetes_prevalence varchar(128),female_smokers varchar(128),male_smokers varchar(128),handwashing_facilities varchar(128),hospital_beds_per_100k varchar(128),country_2 varchar(128),human_development_index__hdi__2018__value varchar(128),inequality_adjusted_hdi__ihdi__2018__value varchar(128),inequality_in_hdi_2018 varchar(128),physicians_2010_2018 varchar(128),nurses_and_midwifes_2010_2018 varchar(128),hospital_beds_2010_2018 varchar(128),current_health_expenditure_2016 varchar(128),mobile_phone_subscription_2017_2018 varchar(128),fixed_broadband_subscriptions_2017_2018 varchar(128),country_1 varchar(128),population_in_multidimensional_poverty_2009_2018 varchar(128),population_vulnerable_to_multidimensional_poverty_2009_2018 varchar(128),ppp__1_90_a_day_2010_2018 varchar(128),national_poverty_line_2010_2018 varchar(128),working_poor_at_ppp_3_20_a_day__2018____of_total_employment varchar(128),social_protection_and_labour_programs_2007_2016 varchar(128),remittances varchar(128),inflows_2018____of_gdp varchar(128),net_official_development_assistance_received_2017____of_gni varchar(128),inbound_tourism_expenditure_2016_2018____of_gdp varchar(128));