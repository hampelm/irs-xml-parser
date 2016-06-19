# IRS 990 Data Scraper

## To install

`npm install`

## To get the list of 990s available

`aws s3 cp s3://irs-form-990/990index-fixed.json .`

(I think this index may move / change. [Check AWS](https://aws.amazon.com/public-data-sets/irs-990/)
to see if there's a better / newer index.)

## To list orgs that are in our data

Copy the Ledger's organization export to `organizations.csv`.

The run:

`node find.js`

Then save the results to a csv with the headers `ein,year,name,form,exists,url`

## To get those XML docs

`node get.js`

Files will save to `data/`.

## Helpful S3 commands

To list

`aws s3 ls s3://irs-form-990/2012`

To copy

`aws s3 cp s3://irs-form-990/201200629349300310_public.xml .`

To copy all

`aws s3 sync s3://irs-form-990/2012 .`


