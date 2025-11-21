import References from '../../components/Listing/References';
import guitar from '../../config/guitar';

export const getStaticProps = async (context) => {
    const elements = guitar.notes.sharps.flatMap((key) => {
        
        const chords = Object.keys(guitar.arppegios).map((chordKey) => {
            const title = `Chord: ${guitar.arppegios[chordKey].name} in ${key}`;
            return {
                label: title,
                href: `/spreading/chords/${key.replace('#', 'sharp')}/${chordKey.replace('#', 'sharp')}`,
            };
        });

        const arpeggios = Object.keys(guitar.arppegios).flatMap((arppegioKey) => {
            const title = `Arpeggio: ${guitar.arppegios[arppegioKey].name} in ${key}`;
            return [
                {
                    label: title,
                    href: `/references/arppegios/${key.replace('#', 'sharp')}/${arppegioKey.replace('#', 'sharp')}`,
                },
            ];
        });

        const scales = Object.keys(guitar.scales).flatMap((scaleKey) => {
            if (guitar.scales[scaleKey].isModal === true) {
                return [
                    ...guitar.scales[scaleKey].modes.map((mode) => {
                        const title = `Scale: ${guitar.scales[scaleKey].name} in ${key} (Mode: ${mode.name})`;
                        return {
                            label: title,
                            href: `/references/scales/${key.replace('#', 'sharp')}/${scaleKey}/modal/${decodeURIComponent(mode.name.toLowerCase().replace(' ', '-')).replace('#', 'sharp')}`,
                        };
                    }),
                ];
            } else {
                const title = `Scale: ${guitar.scales[scaleKey].name} in ${key} (Single)`;
                return [
                    {
                        label: title,
                        href: `/references/scales/${key.replace('#', 'sharp')}/${scaleKey}/single`,
                    },
                ];
            }
        });

        return [...chords, ...arpeggios, ...scales];
    
    });
    
    return {
        props: {
            elements,
        },
    };
};

export default References;
