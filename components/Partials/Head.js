import Head from 'next/head';

export default function Meta({ title, description }) {
    return (
        <Head>
            <title>{title}</title>
            <meta
                name="format-detection"
                content="telephone=no, date=no, email=no, address=no"
            />
            <meta
                name="keywords"
                content="keys, sharps, scales, modes, arpeggios, C major, G major, D major, A major, E major, B major, F# major, C# major, F major, Bb major, Eb major, Ab major, Db major, Gb major, Cb major, natural minor, harmonic minor, melodic minor, dorian, phrygian, lydian, mixolydian, aeolian, locrian, major arpeggios, minor arpeggios, diminished arpeggios, augmented arpeggios"
            />
            <meta
                name="description"
                content={description}
            />
        </Head>
    );
}
