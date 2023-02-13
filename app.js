// require packages used in the project
const express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser')
const app = express()
const port = 3000

const {clipRaster, clipRasterCustomGeometry} = require("./gsnodeclient");

// const zonalStats = require('./geoserverWPS')

app.use(cors())

var jsonParser = bodyParser.json()

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/api/rasters/lulc/crop/shape',clipRaster);

app.post('/api/rasters/lulc/cropcustom', [jsonParser,clipRasterCustomGeometry] , (req, res) => {
 
})

// app.use('/api/rasters/stats', zonalStats)

// app.get('/api/rasters/lulc/crop/shape', (req, res) => {
//   res.send(midware);
// });

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})
