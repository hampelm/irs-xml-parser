var Baby = require('babyparse');
var fs = require('fs');
var request = require('request');

var i;
var parsed = Baby.parseFiles('results.csv', {
  header: true
});
var rows = parsed.data;

for (i = 0; i < rows.length; i++) {
  var r = rows[i];

  var name = 'data/' + [r.ein, r.year, r.name, r.form].join('_') + '.xml';
  if (r.exists === 'true') {
    request.get(r.url)
           .on('error', console.error)
           .pipe(fs.createWriteStream(name));
    console.log(name);
  }
}

