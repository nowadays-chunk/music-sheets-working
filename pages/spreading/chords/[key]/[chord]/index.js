// pages/references/[key]/arppegios/[arppegio]/[quality]/[shape]/index.js
import ChordComponent from  '../../../../../components/Elements/Spread/ChordComponent';
import guitar from '../../../../../config/guitar';
import fs from 'fs';
import path from 'path';

export const getStaticPaths = async () => {
    const { notes, arppegios, shapes } = guitar;
    const paths = [];

    notes.sharps.forEach((key) => {
        if (arppegios && Object.keys(arppegios).length > 0) {
            Object.keys(arppegios).forEach((arppegioKey) => {
                const arppegio = arppegios[arppegioKey];
                if (arppegio) {
                    paths.push({ params: { key: key.replace('#', 'sharp'), chord: arppegioKey.replace('#', 'sharp') } });
                }
            });
        }
    });

    return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
    const { key, chord} = params;
    const decodedKey = key.replace('sharp', '#');
    const decodedChord = chord.replace('sharp', '#');

    const keyIndex = guitar.notes.sharps.indexOf(decodedKey);
    // Generate the title based on the params
    const title = `Chord: ${guitar.arppegios[decodedChord].name} in ${decodedKey}`;
    
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

    const boards = ['C', 'A', 'G', 'E', 'D'].map((cagedSystemElement) => {
        return {
            keyIndex,
            quality: decodedChord,
            shape: cagedSystemElement,
            board: 'references1-' + cagedSystemElement,
        }
    })
    return {
        props: {
            boards,
            articleContent
        }
    };
};

export default ChordComponent;