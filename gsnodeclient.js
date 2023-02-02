const axios = require("axios");
const { convertToWK } = require("wkt-parser-helper");
const grcImport = require("geoserver-node-client");
const GeoServerRestClient = grcImport.GeoServerRestClient;

const url = "http://78.141.234.158/geoserver/rest/";
const user = "admin";
const pw = "geoserver";
const ws = "Mislanddata";
const grc = new GeoServerRestClient(url, user, pw);

// function to get the data from the API
let getVectorLayer = async (vectName, adminLevel, adminLevel0) => {
  const regionsWfsURL =
    "http://78.141.234.158/geoserver/Misland/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Misland%3AAfrica_countries&maxFeatures=50&outputFormat=application%2Fjson&";
  const subRegionsURL =
    "http://78.141.234.158/geoserver/Misland/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Misland%3AAfrica_adm_1&maxFeatures=950&outputFormat=application%2Fjson&";

  let wfsURL = "";

  if (adminLevel === "1") {
    wfsURL =
      subRegionsURL +
      "CQL_FILTER=NAME_1" +
      "='" +
      vectName.replace(/'/g, "%27").replace(/ /g, "%20") +
      "'" +
      "AND NAME_0" +
      "='" +
      adminLevel0.replace(/'/g, "%27").replace(/ /g, "%20") +
      "'";
  } else if (adminLevel === "0") {
    wfsURL =
      subRegionsURL +
      "CQL_FILTER=NAME_0" +
      "='" +
      vectName.replace(/'/g, "%27").replace(/ /g, "%20") +
      "'";
  } else {
    region = vectName.replace(/'/g, "%27").replace(/ /g, "%20");

    wfsURL = regionsWfsURL + "CQL_FILTER=RegionName" + "='" + region + "'";
  }

  let response = await axios.get(wfsURL);
  return response;
};

const geoserverClip = async function (gemetryJSON, vectName) {
  try {
    // function prettyJson(obj) {
    //   return JSON.stringify(obj, null, 2);
    // }

    const parsed = JSON.parse(JSON.stringify(gemetryJSON));

    let wktVector = convertToWK(parsed);

    //console.log(wktVector)

    let sldName = "lulc" + vectName.replace(/ /g, "_");

    const publishedSLDs = await grc.styles.getAllWorkspaceStyles()
    console.log(publishedSLDs)
    const matchingSld = publishedSLDs.find((d) => d.name === sldName)

    if(!matchingSld){
        const sldBody =
      `<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
        <sld:NamedLayer>
          <sld:Name>kenyadata:landcover_Kenya</sld:Name>
          <sld:UserStyle>
            <sld:Name>Landcover</sld:Name>
            <sld:FeatureTypeStyle>
              <sld:Name>Landconver</sld:Name>
              <Transformation>
        <ogc:Function name="gs:CropCoverage">
              <ogc:Function name="parameter">
                <ogc:Literal>coverage</ogc:Literal>
              </ogc:Function>
              <ogc:Function name="parameter">
                <ogc:Literal>cropShape</ogc:Literal>
                <ogc:Literal>` +
      `${wktVector}` +
      `
                </ogc:Literal>
              </ogc:Function>
        </ogc:Function>
      </Transformation>
              <sld:Rule>
                <sld:RasterSymbolizer>
                  <sld:ChannelSelection>
                    <sld:GrayChannel>
                      <sld:SourceChannelName>1</sld:SourceChannelName>
                      <sld:ContrastEnhancement>
                        <sld:GammaValue>1.0</sld:GammaValue>
                      </sld:ContrastEnhancement>
                    </sld:GrayChannel>
                  </sld:ChannelSelection>
                  <sld:ColorMap type="values">
                    <sld:ColorMapEntry color="#0046c8" quantity="1" label="Water"/>
                    <sld:ColorMapEntry color="#fff5d7" quantity="2" label="Bareland"/>
                    <sld:ColorMapEntry color="#d7191c" quantity="3" label="Artificial "/>
                    <sld:ColorMapEntry color="#33e9f6" quantity="4" label="Wetland"/>
                    <sld:ColorMapEntry color="#f2fc83" quantity="5" label="Cropland"/>
                    <sld:ColorMapEntry color="#f7ba02" quantity="6" label="Grassland"/>
                    <sld:ColorMapEntry color="#007300" quantity="7" label="Forest"/>
                  </sld:ColorMap>
                  <sld:ContrastEnhancement/>
                </sld:RasterSymbolizer>
              </sld:Rule>
            </sld:FeatureTypeStyle>
          </sld:UserStyle>
        </sld:NamedLayer>
      </sld:StyledLayerDescriptor>
    `;

    console.log(
      "Publish GeoServer style",
      await grc.styles.publish(ws, sldName, sldBody)
    );
    }

    return sldName;
  } catch (error) {
    console.error("#### Error message #####");
    console.error(error.message);

    console.error("#### Whole Error Object #####");
    console.error(error);
  }
};

//controller function
module.exports = async (req, res) => {
  console.log(req.query);
  const { vectID, adminID, admin0ID } = req.query;
  let responseFact = await getVectorLayer(vectID, adminID, admin0ID);
  let styleName = await geoserverClip(responseFact.data, vectID);
  res.send([{ sldName: `${styleName}` }]);
};