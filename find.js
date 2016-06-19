var Baby = require('babyparse');
var fs = require('fs');
var readline = require('readline');

var i;
var parsed = Baby.parseFiles('organizations.csv', {
  header: true
});
var rows = parsed.data;

var eins = [];
for (i = 0; i < rows.length; i++) {
  if (rows[i].EIN !== '') {
    eins.push(rows[i].EIN);
  }
}

console.log("Got EINS", eins);


// Go through the json file
var rl = readline.createInterface({
    input: fs.createReadStream('990index-fixed.json'),
    output: process.stdout,
    terminal: false
});

var found = [];

rl.on('line', function(line) {
  try {
    // Trim the comma off the end
    var data = JSON.parse(line.substring(0, line.length - 1));
  }
  catch(e) {
    // console.log(e);
    console.log("Not JSON: ", line);
  }

  if (data) {
    if (eins.indexOf(data.EIN) !== -1) {
      //console.log(data);

      console.log([
        data.EIN,
        data.TaxPeriod,
        data.OrganizationName,
        data.FormType,
        data.IsAvailable,
        data.URL
      ].join(','));
    }
  }
});
