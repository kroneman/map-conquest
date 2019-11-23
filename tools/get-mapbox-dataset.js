const path = require('path');
const util = require('util');
const fse = require('fs-extra');
const axios = require('axios');

const OUTPUT_PATH = path.resolve(__dirname, '../data/mapboxdataset.json');
require('dotenv').config({
  path: path.resolve('.env')
});

const {
  MAPBOX_USER_NAME,
  MAPBOX_ACCESSTOKEN,
  MAPBOX_COUNTRYDATASETID
} = process.env;

// Set config defaults when creating the instance
const BASE_URL = `https://api.mapbox.com/datasets/v1/${MAPBOX_USER_NAME}/${MAPBOX_COUNTRYDATASETID}`;
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // allows us to get updates faster to test when developing
    'Cache-Control': 'no-cache'
  }
});
const writeJSON = util.promisify(fse.writeJSON);

main();
async function main() {
  try {
    const dataSet = await getDataSetFeatures();
    if (!dataSet) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch dataset');
      return;
    }

    await writeJSON(OUTPUT_PATH, dataSet);
    // eslint-disable-next-line no-console
    console.log(`Updated mapboxdataset and placed in ${OUTPUT_PATH}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}

async function getDataSetFeatures() {
  try {
    const { data } = await api.get(`/features?access_token=${MAPBOX_ACCESSTOKEN}`);
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
    return false;
  }
}
