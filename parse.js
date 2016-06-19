var fs = require('fs');
var _ = require('lodash');
var xml2js = require('xml2js');

var i;
var files = fs.readdirSync('data');
var results = [];

var synonyms = {
  'TaxYear': ['TaxYr'],
  'ReturnType': ['ReturnTypeCd'],
  'TaxPeriodBeginDate': ['TaxPeriodEndDt'],
  'TotalExpensesRevAndExpnss': ['TotalExpensesRevAndExpnssAmt'],
  // This is total rev, not rev + expenses (wtf)
  'TotalRevenueAndExpenses': ['TotalRevAndExpnssAmt'], // See Rockefeller post 2013 I think.
  'ContriGiftsPaidRevAndExpnss': [''],
  'TotOprExpensesRevAndExpnss': ['TotOprExpensesRevAndExpnssAmt'],
};

function trySynonyms(key, data) {
  var ideas = synonyms[key];
  var i;
  if (!ideas) {
    return false;
  }

  for (i = 0; i < ideas.length; i++) {
    try {
      return data[ideas[i]][0];
    } catch (e) { }
  }
  return false;
}


function parse(error, result) {
  var r = result.Return;
  var version = result.Return.$.returnVersion;

  var p = {};

  // This is terrible form. Never do this.
  // Add data from header
  function extract(key, path) {
    var rh;
    try {
      rh = _.at(r, path)[0][0];
    } catch(x) {
      console.log("No path", path);
      console.log(r.$);
      return;
    }

    try {
      p[key] = rh[key][0];
    } catch (e) {
      var d = trySynonyms(key, rh);
      p[key] = d;
      if (!d) {
        console.log("No key", key);
      }
    }
  }

  function efh(key) {
    return extract(key, 'ReturnHeader');
  }

  function efd(key) {
    return extract(key, 'ReturnData');
  }

  // Private Foundation
  function efpf(key, source) {
    return extract(key, 'ReturnData[0].IRS990PF[0].' + source);
  }

  efh('TaxYear');
  efh('ReturnType');
  efh('TaxPeriodBeginDate');

  console.log(r.$);
  //console.log(r.ReturnData[0]);
  //console.log(r.ReturnData[0].IRS990PF[0]);
  //console.log(r.ReturnData[0].IRS990PF[0].AnalysisOfRevenueAndExpenses);

  efpf('TotalExpensesRevAndExpnss', 'AnalysisOfRevenueAndExpenses');
  efpf('TotalRevenueAndExpenses', 'AnalysisOfRevenueAndExpenses');
  efpf('ContriGiftsPaidRevAndExpnss', 'AnalysisOfRevenueAndExpenses');
  efpf('TotOprExpensesRevAndExpnss', 'AnalysisOfRevenueAndExpenses');
  // AnalysisOfRevenueAndExpenses:
  //
  // TotalExpensesRevAndExpnss
  // Total expenses
  //
  // Total Revenue
  // TotalRevenueAndExpenses
  //
  // Grants paid:
  // ContriGiftsPaidRevAndExpnss
  //
  // Operating expenses:
  // TotOprExpensesRevAndExpnss


  // Assets etc ---------- (BalanceSheets)
  efpf('TotalAssetsBOY', 'BalanceSheets');
  efpf('TotalAssetsEOY', 'BalanceSheets');
  efpf('TotalLiabilitiesBOY', 'BalanceSheets');
  efpf('TotalLiabilitiesEOY', 'BalanceSheets');
  //
  // Total assets BOY/EOY
  // TotalAssetsBOY
  // TotalAssetsEOY
  //
  // TotalLiabilitiesBOY
  // TotalLiabilitiesEOY
  //
  //
  // Grants ------
  // SupplementaryInformation
  // GrantOrContriPaidDuringYear
  //    RecipientBusinessName
  //      BusinessNameLine1
  //    RecipientUSAddress
  //      AddressLine1
  //      City
  //      State
  //      ZIPCode
  //    RecipientRelationship
  //    RecipientFoundationStatus
  //    PurposeOfGrantOrContribution
  //    Amount

  console.log(p);
}

function decode(error, data) {
  var parser = new xml2js.Parser();
  parser.parseString(data, parse);
}

for (i = 0; i < files.length; i++) {
  // console.log("TRYING " + files[i] + ' ---------------');
  fs.readFile(__dirname + '/data/' + files[i], decode);
}

