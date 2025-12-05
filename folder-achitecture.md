core/
└── music/
    ├── score/
    │   ├── Score.js
    │   ├── Measure.js
    │   ├── Voice.js
    │   ├── Note.js
    │   ├── Rest.js
    │   ├── Pitch.js
    │   ├── Duration.js
    │   ├── Articulation.js
    │   ├── Tie.js -- you didn't giv me
    │   ├── Clef.js
    │   ├── KeySignature.js
    │   ├── TimeSignature.js
    │   ├── LayoutRules.js -- you didn't giv me 
    │   ├── ScoreSerializer.js -- you didn't giv me
    │   └── index.js -- you didn't giv me
    │
    ├── utils/
    │   ├── pitchUtils.js
    │   ├── durationUtils.js
    │   ├── quantization.js
    │   ├── fretUtils.js         ← integrates with your fretboard
    │   ├── staffUtils.js
    │   └── musicMath.js
    │
    ├── render/
    │   ├── NotationRenderer.js
    │   ├── TabRenderer.js
    │   ├── CombinedRenderer.js
    │   ├── BeamEngine.js
    │   ├── TupletEngine.js
    │   ├── TieEngine.js
    │   └── VexflowExtensions.js
    │
    ├── playback/
    │   ├── PlaybackEngine.js
    │   ├── InstrumentManager.js
    │   ├── Scheduler.js
    │   ├── MidiMapper.js
    │   └── TrackMixer.js
    │
    ├── import/
    │   ├── MidiImport.js
    │   ├── MusicXMLImport.js
    │   └── GPImport.js (optional, Guitar Pro)
    │
    ├── export/
    │   ├── MidiExport.js
    │   ├── MusicXMLExport.js
    │   └── PDFExport.js
    │
    └── state/
        ├── scoreReducer.js
        ├── scoreActions.js
        ├── scoreSelectors.js
        └── scoreStore.js (Zustand or Redux slice)


components/
└── ScoreEditor/
    ├── ScoreEditor.jsx     ← Main editor container
    ├── ScoreCanvas.jsx     ← Renders notation + TAB with VexFlow
    ├── TabCanvas.jsx       ← Dedicated TAB renderer
    ├── Timeline.jsx        ← Piano-roll timeline editor
    │
    ├── panels/
    │   ├── ToolsPalette.jsx
    │   ├── Inspector.jsx
    │   ├── LayersPanel.jsx
    │   ├── TransportBar.jsx
    │   └── TracksList.jsx
    │
    ├── inputs/
    │   ├── KeyboardInput.js
    │   ├── FretboardInput.js  ← integrates with your FretboardDisplay
    │   ├── MouseInput.js
    │   └── EditorCommands.js
    │
    ├── modals/
    │   ├── TimeSignatureModal.jsx
    │   ├── KeySignatureModal.jsx
    │   ├── MeasureModal.jsx
    │   └── ExportModal.jsx
    │
    ├── styles/
    │   ├── scoreEditor.css
    │   ├── palette.css
    │   └── timeline.css
    │
    └── index.js


pages/
└── score/
    ├── index.jsx
    └── [id].jsx    ← For loading saved scores



public/
└── soundfonts/
    ├── piano.sf2
    ├── guitar.sf2
    └── percussion.sf2




public/
└── samples/
    ├── sample1.mid
    ├── sample2.mid
    └── bach-invention.mid


ui/edito
    Toolbar.jsx
    TransportBar.jsx
    ScoreCanvas.jsx
    PalettePanel.jsx
    InspectorPanel.jsx
    MixerPanel.jsx
    Navigator.jsx
    Layout.jsx
    KeyboardShortcutsOverlay.jsx
    MenuBar.jsx
    FileMenu.jsx
    TabBar.jsx


ui/fretboard
    FretboardInputBridge.jsx




ui/app
    AppShell.jsx
