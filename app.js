// require packages used in the project
const express = require('express')
const cors = require('cors')
const app = express()
const port = 8600

const midware = require("./gsnodeclient");

// const zonalStats = require('./geoserverWPS')

app.use(cors())

app.use('/api/rasters/lulc/crop/shape',midware);

// app.use('/api/rasters/stats', zonalStats)

// app.get('/api/rasters/lulc/crop/shape', (req, res) => {
//   res.send(midware);
// });

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})
