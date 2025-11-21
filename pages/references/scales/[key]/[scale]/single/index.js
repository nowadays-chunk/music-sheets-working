import fs from 'fs';
import path from 'path';
import ScaleComponent from '../../../../../../components/Elements/ScaleComponent';
import guitar from '../../../../../../config/guitar';

export const getStaticPaths = async () => {
    const { notes, scales, shapes } = guitar;
    const paths = [];

    notes.sharps.forEach((key) => {
        Object.keys(scales).forEach((scaleKey) => {
            const scale = scales[scaleKey];
            if (!scale.isModal) {
                shapes.names.forEach((shape) => {
                    paths.push({ params: { key: key.replace("#", "sharp"), scale: scaleKey } });
                });
            }
        });
    });

    return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
    const { key, scale } = params;
    const decodedKey = key.replace("sharp", "#");

    const keyIndex = guitar.notes.sharps.indexOf(decodedKey);
    const scaleObj = guitar.scales[scale];

    // Generate the title based on the params
    const title = `Scale ${scaleObj.name} in ${decodedKey} Single`;

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
            modeIndex: -1,
            shape: '',
            board: 'references2',
            articleContent,  // Pass the content of the article as props
        },
    };
};

export default ScaleComponent;