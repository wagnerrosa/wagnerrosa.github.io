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
  // back to the Cucina's south wall, looking north at the door 80/220 with the window 50/150 to its right (their place in the image
  // puts the camera mid-wall); the door to the Soggiorno, at the top of the new stair, is on the left
  { file: 'cucina', titolo: 'Cucina', at: [1673, 1020, -93] },
  // from the door 80/190 in the north wall, looking in; the roof window is ahead on the left
  { file: 'sgombero-camera', titolo: 'Sgombero, futura camera', at: [2086, 706, 88] },
];
