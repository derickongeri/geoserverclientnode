const axios = require("axios");

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

module.exports = {
  getVectorLayer,
};
