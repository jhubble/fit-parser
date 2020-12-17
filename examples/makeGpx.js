var FitParser = require('../dist/fit-parser.js').default;
var fs = require('fs');

var file = process.argv[2];
var range = process.argv[3];

if (!file) {
  console.log('USAGE: node makeGpx.js fitfile.fit');
  console.log('outputs a gpx flie on standard output');
  console.log('optional third parameter is used to only allow');
  console.log('longitude within +-5 degrees of that value');
  console.log('node makeGpx.js fitfile.fit 125');
  process.exit();
}

fs.readFile(file, function (err, content) {
  var fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  const outputGpx = (json) => {
    let gpx = [
      '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
      '<gpx version="1.1" creator="GPS Visualizer https://www.gpsvisualizer.com/" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
      '<trk>',
    ];
    // TODO: Get actual info from FIT file
    gpx.push('<name>Converted Track</name>');
    gpx.push('<desc>Converted from FIT file</desc>');
    gpx.push('<trkseg>');
    json.records.forEach((r) => {
      //
      if (range) {
        if (+r.position_long > +range + 5 || +r.position_long < +range - 5) {
          console.error(
            'POINT OUTSIDE DESIRED RANGE:',
            r.position_long,
            r.position_lat
          );
          return;
        }
      }
      gpx.push(`<trkpt lat="${r.position_lat}" lon="${r.position_long}">`);
      gpx.push(`<time>${r.timestamp.toISOString()}</time>`);
      gpx.push('<extensions>');
      gpx.push(' <gpxtpx:TrackPointExtension>');
      gpx.push(`  <gpxtpx:hr>${r.heart_rate}</gpxtpx:hr>`);
      gpx.push('</gpxtpx:TrackPointExtension>');
      gpx.push('</extensions>');
      gpx.push('</trkpt>');
    });
    gpx.push('</trkseg>');
    gpx.push('</trk>');
    gpx.push('</gpx>');

    console.log(gpx.join('\n'));
  };

  fitParser.parse(content, function (error, data) {
    if (error) {
      console.error('ERROR:', error);
      console.error(error);
    } else {
      outputGpx(data);
    }
  });
});
