// Renders of the project on /casa/, in page order, and where each one is seen from on the plan.
// Images: casa-src/fotos/<file>.jpg (git-ignored) → node scripts/casa-render.mjs → public/casa/render/<file>.webp (+ thumb/, render.json).
// at = [x, y, direction°] in the plan's frame (src/data/casa-pianta-base.ts: cm, origin top-left, y down; 0° = right, 90° = down).
// Estimated from the images; tweak freely. Without `at` the render shows in the gallery only.
export type Render = { file: string; titolo: string; at?: [number, number, number] };

export const render: Render[] = [
  // the west front from the viale, looking at the Hall door (window of the camera, door, window of the soggiorno); the spot sits just
  // above the section line A, which runs on the door's axis
  { file: 'frente', titolo: 'Ingresso dal viale', at: [285, 560, 2] },
  // just inside the Hall door, looking down the Hall to the door at its end (90/200); the Camera and Soggiorno doors at each side
  { file: 'entrada', titolo: "Hall d'ingresso", at: [965, 588, -2] },
  // just in from the door 80/220 off the Camera (west wall, south end), looking north at the wall of 120; the window 70/60 is on the
  // right, the shower at the far end
  { file: 'wc', titolo: 'Wc della camera', at: [1385, 365, -92] },
  // the first courtyard (+2.10), from its top-right corner looking to the bottom-left one: on the left the south wall with the
  // window 50/150 and the Cucina door 80/220, in the corner the Hall's end door 90/200, on the right the Wc window 70/60
  { file: 'externo-1', titolo: 'Primo cortile', at: [1855, 155, 130] },
  // the same courtyard, back to the Wc window 70/60, looking at the Forno up at +3.10; the steps up to it are ahead
  { file: 'forno', titolo: 'Forno', at: [1525, 266, 16] },
  // back to the Cucina's south wall, looking north at the door 80/220 with the window 50/150 to its right (their place in the image
  // puts the camera mid-wall); the door to the Soggiorno, at the top of the new stair, is on the left
  { file: 'cucina', titolo: 'Cucina', at: [1673, 1020, -93] },
  // from the door 80/190 in the north wall, looking in; the roof window is ahead on the left
  { file: 'sgombero-camera', titolo: 'Sgombero, futura camera', at: [2086, 706, 88] },
  // outdoors, east of the Sgombero: from the stair beside the Forno, looking south down the strip between the Sgombero's east wall
  // (on the right, with the roof) and the slanted wall, to the wall of 15,34 at the end; the shower sits behind the short wall
  { file: 'wc-externo', titolo: 'Wc esterno', at: [2350, 630, 88] },
  // from the foot of the stair beside the Forno, looking the way its arrow points (east), up into the yard at +4.25: the water tanks
  // on the left, in its top-right corner; the stair up to +5.15 ahead
  { file: 'agua2', titolo: 'Scala verso i serbatoi', at: [2268, 597, -2] },
  // the yard at +4.25: from just inside the wall of 15,34, by its dimension, looking to the top-right corner, where the slanted wall
  // meets the north one and the two water tanks go; the stair up to +5.15 through the slanted wall is on the right
  { file: 'agua', titolo: "Serbatoi dell'acqua", at: [3040, 905, -76] },
];
