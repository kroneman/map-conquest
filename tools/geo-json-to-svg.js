
// using a modified version of https://github.com/w8r/geojson2svg
// cloned locally to be able to add property values as attributes on the path
const geojson2svg = require('geojson-to-svg');
// const reproject = require('reproject');
// const proj4 = require('proj4');
// const EPSG3857 = require('epsg-index/s/3857.json');
const path = require('path');
const fse = require('fs-extra');

const OUTPUT_PATH = path.resolve(__dirname, '../client/components/map');
const VUE_TEMPLATE = path.resolve(OUTPUT_PATH, './map.template.vue');
const OUTPUT_FILE = path.join(OUTPUT_PATH, './map.generated.vue');

const dataset = require('../data/mapbox-dataset.json');
const datasetCenterOfMass = require('../data/centers-of-mass.json');

const styles = {
  Point: {
    fill: 'transparent',
    color: '#fff',
    opacity: 0.7,
    stroke: '#fff',
    weight: 0.5
  },
  Polygon: {
    color: '#fff',
    weight: 1,
    opacity: 0.7
  }
};
styles.MultiPolygon = styles.Polygon;

main();
async function main() {
  const combinedData = combineDataSet();
  const flipVertical = ([lat, long]) => {
    const isPositive = long > 0;
    const newlong = isPositive ? 0 - Math.abs(long) : Math.abs(long);
    const scaleLat = lat * 10;
    const scaleLong = newlong * 10;
    return [
      scaleLat,
      scaleLong
    ];
  };
  const svgElementsRender = geojson2svg()
    .projection(([lat, long]) => {
      const flipped = flipVertical([lat, long]);
      return flipped;
      // const newCoords = proj4(EPSG3857.proj4, flipped);
      // return newCoords;
    })
    .styles(styles)
    .data(combinedData)
    .render();

  try {
    const vueTemplateBuffer = await fse.readFile(VUE_TEMPLATE);
    const vueTemplate = vueTemplateBuffer.toString();
    const outputString = vueTemplate.replace('<replace-with-generated />', svgElementsRender);
    await fse.writeFile(
      OUTPUT_FILE,
      outputString
    );

    // eslint-disable-next-line no-console
    console.log(`Successfully generated file ${OUTPUT_FILE}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

function combineDataSet() {
  const modifiedCenterOfMass = datasetCenterOfMass.features.map((feature) => {
    // eslint-disable-next-line no-param-reassign
    feature.properties.radius = 2;
    return feature;
  });

  const combined = {};
  combined.type = dataset.type;
  combined.features = [
    ...dataset.features,
    ...modifiedCenterOfMass
  ];
  return combined;
}
