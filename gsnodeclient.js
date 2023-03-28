const { getVectorLayer } = require("./modules/fetchvector");
const { geoserverClip } = require("./modules/clipRaster");

const clipRaster = async (req, res) => {
  //console.log(req.query);
  const { vectID, adminID, admin0ID } = req.query;
  let responseFact = await getVectorLayer(vectID, adminID, admin0ID);
  let styleName = await geoserverClip(responseFact.data, vectID);
  res.send([{ sldName: `${styleName}` }]);
};

const clipRasterCustomGeometry = async (req, res) => {
  let styleName = await geoserverClip( req.body, req.body.type );
  res.send([{ sldName: `${styleName}` }]);
};

//controller function
module.exports = {
  clipRaster,
  clipRasterCustomGeometry
}

