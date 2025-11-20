import fs from 'fs';
import path from 'path';
import ArpeggioComponent from '../../../../../components/Elements/ArppegioComponent';
import guitar from '../../../../../config/guitar';

export const getStaticPaths = async () => {
    const { notes, arppegios } = guitar;
    const paths = [];

    notes.sharps.forEach((key) => {
        if (arppegios && Object.keys(arppegios).length > 0) {
            Object.keys(arppegios).forEach((arppegioKey) => {
                const arppegio = arppegios[arppegioKey];
                if (arppegio) {
                    paths.push({ params: { key: key.replace('#', 'sharp'), arppegio: arppegioKey.replace('#', 'sharp') } });
                }
            });
        }
    });

    return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
    const { key, arppegio } = params;

    const keyIndex = guitar.notes.sharps.indexOf(key);
    const decodedKey = key.replace('sharp', '#');
    const decodedArppegio = arppegio.replace('sharp', '#');

    // Generate the title based on the params
    const title = `Arpeggio ${guitar.arppegios[decodedArppegio].name} in ${decodedKey}`;

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
            quality: decodedArppegio,
            shape: '',
            board: 'references3',
            articleContent  // Pass the content of the article as props
        },
    };
};

export default ArpeggioComponent;
