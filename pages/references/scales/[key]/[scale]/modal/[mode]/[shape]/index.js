// pages\references\[key]\scales\[scale]\modal\[mode]\[shape]\index.js
import ScaleComponent from '../../../../../../../../components/Elements/ScaleComponent';
import guitar from '../../../../../../../../config/guitar';
import fs from 'fs';
import path from 'path';

export const getStaticPaths = async () => {
  const { notes, scales, shapes } = guitar;
  const paths = [];

  notes.sharps.forEach((key) => {
    Object.keys(scales).forEach((scaleKey) => {
      const scale = scales[scaleKey];
      if (scale.isModal) {
        scale.modes.forEach((mode) => {
          shapes.names.forEach((shape) => {
            paths.push({ params: { key: key.replace('#', 'sharp'), scale: scaleKey, mode: mode.name.toLowerCase().replace(' ', '-').replace('#', 'sharp'), shape: shape } });
          });
        });
      }
    });
  });

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
  const { key, scale, mode, shape } = params;
  const decodedKey = key.replace('sharp', '#');
  const decodedMode = mode.replace('sharp', '#');
  const keyIndex = guitar.notes.sharps.indexOf(decodedKey);
  const scaleObj = guitar.scales[scale];

  let modeIndex = -1;
  if (scaleObj && scaleObj.isModal) {
    modeIndex = scaleObj.modes.findIndex((m) => m.name.toLowerCase().replace(' ', '-') === decodedMode);
  }

  const validMode = modeIndex >= 0 ? modeIndex : 0;
  const validShape = shape || null;

  // Generate the title based on the params
  const title = `Scale ${scaleObj.name} in ${decodedKey} Mode ${scaleObj.modes[validMode].name} Shape ${validShape})`;
  // Define the path to the JSON file
  const fileName = `article_${title.replace(/[^\w\s#]/gi, '').replace(/\s+/g, '_')}.json`;
  const filePath = path.join(process.cwd(), 'articles', fileName);

  // Read the content of the JSON file
  let articleContent = {};
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    articleContent = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }

  return {
    props: {
      keyIndex,
      scale: scale,
      modeIndex: validMode,
      shape: validShape,
      board: 'references2',
      articleContent
    },
  };
};

export default ScaleComponent;