// require packages used in the project
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const ee = require("@google/earthengine");
const privateKey = require("./agristats-378216-b464955961eb.json");
const app = express();

const port = 3000;

const { clipRaster, clipRasterCustomGeometry } = require("./gsnodeclient");
const { initializeGee, getGeeRaster } = require("./modules/geeScript");

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

// Define endpoint at /mapid
app.post("/api/mapid", [jsonParser, initializeGee]);

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
