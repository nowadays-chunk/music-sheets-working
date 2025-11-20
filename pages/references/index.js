import References from '../../components/Listing/References';
import guitar from '../../config/guitar';

export const getStaticProps = async (context) => {
    const elements = guitar.notes.sharps.flatMap((key) => {
        const chords = Object.keys(guitar.arppegios).flatMap((chordKey) => {
            return [
                ...guitar.shapes.names.map((shape) => {
                    const title = `Chord: ${guitar.arppegios[chordKey].name} in ${key} (Shape: ${shape})`;
                    return {
                        label: title,
                        href: `/references/chords/${key.replace('#', 'sharp')}/${chordKey.replace('#', 'sharp')}/${shape}`,
                    };
                })
            ];
        });

        const arpeggios = Object.keys(guitar.arppegios).flatMap((arppegioKey) => {
            const title = `Arpeggio: ${guitar.arppegios[arppegioKey].name} in ${key}`;
            return [
                {
                    label: title,
                    href: `/references/arppegios/${key.replace('#', 'sharp')}/${arppegioKey.replace('#', 'sharp')}`,
                },
                ...guitar.shapes.names.map((shape) => {
                    const title = `Arpeggio: ${guitar.arppegios[arppegioKey].name} in ${key} (Shape: ${shape})`;
                    return {
                        title: title,
                        label: `Arpeggio: ${guitar.arppegios[arppegioKey].name} in ${key} (Shape: ${shape})`,
                        href: `/references/arppegios/${key.replace('#', 'sharp')}/${arppegioKey.replace('#', 'sharp')}/${shape}`,
                    };
                }),
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
                    ...guitar.scales[scaleKey].modes.flatMap((mode) => {
                        return guitar.shapes.names.map((shape) => {
                            const title = `Scale: ${guitar.scales[scaleKey].name} in ${key} (Mode: ${mode.name}, Shape: ${shape})`;
                            return {
                                label: title,
                                href: `/references/scales/${key.replace('#', 'sharp')}/${scaleKey}/modal/${decodeURIComponent(mode.name.toLowerCase().replace(' ', '-')).replace('#', 'sharp')}/${shape}`,
                            };
                        });
                    }),
                ];
            } else {
                const title = `Scale: ${guitar.scales[scaleKey].name} in ${key} (Single)`;
                return [
                    {
                        label: title,
                        href: `/references/scales/${key.replace('#', 'sharp')}/${scaleKey}/single`,
                    },
                    ...guitar.shapes.names.map((shape) => {
                        const title = `Scale: ${guitar.scales[scaleKey].name} in ${key} (Single, Shape: ${shape})`;
                        return {
                            label: title,
                            href: `/references/scales/${key.replace('#', 'sharp')}/${scaleKey}/single/${shape}`,
                        };
                    }),
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
