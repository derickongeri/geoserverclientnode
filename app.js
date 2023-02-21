// require packages used in the project
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const ee = require("@google/earthengine");
const privateKey = require("./agristats-378216-b464955961eb.json");
const app = express();

const port = 3000;

const { clipRaster, clipRasterCustomGeometry } = require("./gsnodeclient");

// const zonalStats = require('./geoserverWPS')

app.use(cors());

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use("/api/rasters/lulc/crop/shape", clipRaster);

app.post(
  "/api/rasters/lulc/cropcustom",
  [jsonParser, clipRasterCustomGeometry],
  (req, res) => {}
);

// app.use('/api/rasters/stats', zonalStats)

// app.get('/api/rasters/lulc/crop/shape', (req, res) => {
//   res.send(midware);
// });

// Define endpoint at /mapid.
app.get("/mapid", (_, response) => {
  ee.reset()

  var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017");

  var country = countries.filter(ee.Filter.eq("country_na", "Kenya"));

  var image = ee.Image("UMD/hansen/global_forest_change_2021_v1_9");

  //image = image.clip(country);

  // Define the visualization parameters
  var visParams = {
    bands: ["lossyear"],
    min: 0,
    max: 21,
    palette: ["yellow", "red"],
  };

  // Get the map ID for the image
  var mapId = image.getMap(visParams);

  // Define the tile coordinates and zoom level
  var x = 525;
  var y = 345;
  var z = 10;

  // Get the URL for the tile using the map ID
  var url = ee.data.getTileUrl({
    mapid: mapId.mapid,
    token: mapId.token,
    x: x,
    y: y,
    z: z,
  });

  console.log(url);

  // Construct WMS URL

  image.getMap(visParams, ({ mapid }) => {
    //const wmsUrl = `https://earthengine.googleapis.com/map/${mapid}/wms?`;
    response.send(mapid);
    console.log(mapid);
  });

});

console.log("Authenticating Earth Engine API using private key...");
ee.data.authenticateViaPrivateKey(
  privateKey,
  () => {
    console.log("Authentication successful.");
    ee.initialize(
      null,
      null,
      () => {
        console.log("Earth Engine client library initialized.");
        //app.listen(port);
        console.log(`Listening on port ${port}`);
      },
      (err) => {
        console.log(err);
        console.log(
          `Please make sure you have created a service account and have been approved.
Visit https://developers.google.com/earth-engine/service_account#how-do-i-create-a-service-account to learn more.`
        );
      }
    );
  },
  (err) => {
    console.log(err);
  }
);

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`);
});
