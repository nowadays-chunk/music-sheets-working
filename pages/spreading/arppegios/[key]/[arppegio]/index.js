import ArpeggioComponent from  '../../../../../components/Elements/Spread/ArppegioComponent';
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

    const boards = ['C', 'A', 'G', 'E', 'D'].map((cagedSystemElement) => {
        return {
            keyIndex,
            quality: decodedArppegio,
            shape: cagedSystemElement,
            board: 'references3' + '-' + cagedSystemElement,
        }
    })

    return {
        props: {
        boards: boards,
        articleContent: {
            title: title
        }
        },
    };
};

export default ArpeggioComponent;



