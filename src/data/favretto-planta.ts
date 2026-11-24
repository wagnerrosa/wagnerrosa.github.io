// Site plan of /favretto/ (drawn by src/lib/favretto-planta.ts). Everything is in metres, east (E) and north (N) of the point right under
// drone photo 0049 (lat -29.9585306, lng -51.0099209). North is up.
//
// How it was traced (2026-11-24):
// - Photos 0049 (225 m up) and 0059 (373 m up) look straight down. Each was projected onto the ground from its GPS, height, gimbal yaw and
//   the camera (DJI Air 2S, 8.38 mm on a 13.2 mm sensor), then fitted to the satellite images (Esri and Google tiles agree within 1 m):
//   both needed the same turn (+4.6°, the drone's compass) and +3 % scale, so the same turn is applied to every photo's direction below.
// - Buildings, ponds and roads come from 0049 (6.5 cm per pixel; roofs snapped to their edges). Woods, wetland, river and the BR-290 come
//   from the satellite images and from 0059 (both satellites show the river high, so the wetland is drawn as it looks in the drone photos).
// - Sizes are good to about a metre around the houses and sheds, to a few metres at the edges. Areas are shown as approximate.
//   The property line is not known: none is drawn.

export const FRAME = { e0: -490, e1: 410, n0: -265, n1: 335 };   // 900 × 600 m

/** Satellite view (Google embed, loaded only when asked for): the frame's centre. */
export const MAP = { lat: -29.9582149, lng: -51.0103352, zoom: 17 };
/** Phones show an upright strip of the frame: its whole height, as wide as the box's shape allows (the box is sized to the screen),
 *  centred on E `e`, and pan sideways to the rest. They start on the farmyard, 270 m wide around E -8, from just under the highway
 *  (N 222) down as far as the box's shape reaches: a taller box shows more of the wetland, never a cut label at the top. */
export const PHONE = { e: -25, start: { e: -8, top: 222, w: 270 } };

type P = [number, number];

// BR-290 (Freeway): points on the central barrier; the paved width runs 25 m south and 21 m north of it.
export const highway = {
  barrier: [[-520, 201], [-440, 210.5], [-300, 227.25], [-200, 245.5], [-100, 265], [0, 288.5], [120, 315.25], [260, 346]] as P[],
  south: -25,
  north: 21,
};

/** Dry ground (fields, the farmyard). Everything outside it is wetland or river, unless a wood is drawn on it. */
export const land: P[] = [
  [-510, 112], [-450, 114], [-400, 118], [-350, 146], [-300, 164], [-240, 170], [-200, 168], [-160, 176], [-130, 188], [-100, 200], [-60, 208], [-20, 214], [20, 216], [60, 212],
  [95, 205], [115, 180], [150, 150], [165, 110], [160, 70], [140, 40], [125, 20], [122, -20], [120, -60], [112, -80], [95, -86], [60, -80],
  [20, -74], [-20, -66], [-60, -60], [-100, -56], [-130, -54], [-150, -62], [-170, -80], [-190, -96], [-210, -104], [-240, -104],
  [-270, -100], [-300, -104], [-320, -120], [-335, -140], [-322, -165], [-310, -190], [-300, -230], [-296, -280], [-510, -280],
];
/** Houses north-east, between the highway and the river (neighbours; drawn, not named). */
export const vila: P[] = [[150, 218], [200, 212], [250, 212], [300, 200], [350, 196], [430, 196], [430, 345], [150, 345]];

/** Woods. `top` (woods north of the highway, up to the edge of the frame) is built from the highway in the lib. */
export const woods: P[][] = [
  // along the highway, south side, down to the river
  [[-510, 178], [-420, 186], [-350, 191], [-300, 202], [-200, 220], [-100, 239], [0, 262], [60, 276], [150, 296], [150, 220],
    [110, 238], [60, 248], [20, 244], [-20, 240], [-60, 232], [-90, 226], [-110, 212], [-140, 196], [-200, 186], [-260, 180], [-350, 172],
    [-420, 166], [-510, 164]],
  // the row of trees between the river and the fields
  [[-350, 148], [-300, 164], [-240, 170], [-200, 168], [-160, 176], [-130, 188], [-100, 200], [-60, 208], [-20, 214], [20, 216], [60, 212],
    [95, 205], [110, 185], [100, 175], [60, 186], [20, 190], [-20, 190], [-60, 186], [-100, 176], [-140, 160], [-200, 148], [-260, 140],
    [-300, 128], [-350, 104]],
  // west: the big wood south of the river, and smaller ones by the road in from the south
  [[-510, 112], [-450, 112], [-400, 116], [-350, 140], [-318, 140], [-312, 110], [-322, 80], [-330, 40], [-334, 0], [-338, -60], [-350, -95],
    [-375, -110], [-410, -105], [-430, -80], [-460, -30], [-490, -15], [-510, -18]],
  [[-510, -170], [-470, -160], [-440, -150], [-410, -140], [-392, -152], [-386, -185], [-392, -230], [-398, -280], [-510, -280]],
  // east of the farmyard
  [[80, 200], [110, 190], [140, 160], [170, 140], [175, 100], [160, 60], [140, 40], [120, 40], [100, 60], [90, 100], [85, 150]],
  [[165, 75], [200, 90], [240, 80], [265, 45], [285, 20], [290, -20], [275, -45], [250, -62], [215, -55], [190, -20], [170, 20], [160, 50]],
  // further east, in the wetland
  [[280, 122], [298, 124], [312, 108], [330, 104], [348, 112], [362, 140], [375, 160], [392, 175], [400, 160], [388, 120], [372, 82], [350, 66],
    [320, 68], [298, 80], [282, 100]],
  [[290, 50], [310, 57], [335, 52], [352, 35], [357, 0], [345, -30], [320, -40], [300, -35], [288, -10], [286, 25]],
  [[380, 180], [400, 185], [430, 180], [430, -95], [395, -90], [384, -60], [388, -20], [392, 20], [385, 60], [378, 100], [386, 140]],
  [[325, -85], [345, -70], [370, -75], [400, -85], [430, -90], [430, -180], [390, -195], [360, -190], [335, -170], [320, -140], [318, -110]],
  // islands in the wetland
  [[150, -29], [162, -26], [172, -33], [173, -46], [163, -54], [150, -51], [146, -40]],
  [[142, -122], [160, -118], [168, -132], [165, -152], [152, -161], [143, -148]],
  // south-east and south-west
  [[-35, -280], [-25, -240], [-5, -222], [20, -205], [42, -195], [73, -176], [104, -170], [142, -163], [181, -172], [215, -192], [250, -200],
    [290, -205], [330, -212], [336, -280]],
  [[-365, -170], [-340, -160], [-325, -172], [-312, -190], [-304, -215], [-298, -280], [-355, -280]],
];

/** Ponds. The açude has a small round island near its south end. */
export const acude: P[] = [
  [-101.5, 56], [-98, 52], [-97.5, 41.5], [-94, 30], [-94.5, 23.5], [-97, 17.5], [-96, 13], [-96, 7], [-92.5, 6.5], [-94, -1.5], [-92, -6],
  [-90.5, -6], [-84, -16], [-84, -21.5], [-86.5, -33.5], [-84, -35.5], [-85, -37], [-91, -38], [-94.5, -39], [-97.5, -37], [-100, -33],
  [-99.5, -28], [-102, -22], [-104.5, -19.5], [-106.5, -19.5], [-109, -8.5], [-113, -2], [-119.5, 13.5], [-127.5, 27.5], [-130, 36],
  [-129.5, 43], [-126.5, 44.5], [-124.5, 48], [-119.5, 49.5], [-117.5, 52], [-111, 50.5], [-108, 55],
];
export const ilha = { c: [-92.5, -19] as P, r: 4 };
/** The three tanks north of the sheds: one basin split by two dykes (the east one stops short of the south bank). */
export const tanques: P[] = [[-9, 66], [72, 66], [73, 48], [72, 30], [70, 22], [66, 17], [19, 41], [10, 46], [0, 50], [-6, 52], [-9, 58]];
export const diques: P[][] = [[[20, 66], [20, 41]], [[46, 66], [46, 34]]];
export const lagoa: P[] = [[70, 160], [78, 166], [82, 150], [80, 132], [72, 128], [66, 140]];

/** Roads (gravel, about 4 m wide) and tracks (dashed). */
export const roads: P[][] = [
  // from the south-west (where it comes in from the local roads) up to the houses, then down past them to the sheds
  [[-352, -280], [-362, -230], [-372, -190], [-378, -162], [-358, -130], [-340, -104], [-326, -84], [-316, -56], [-308, -36], [-296, -18], [-280, -6], [-256, 4], [-228, 16], [-200, 30], [-170, 42], [-140, 53], [-120, 62],
    [-100, 69], [-60, 71], [-40, 69], [-30, 62], [-25, 46], [-24, 29], [-26, 9], [-30, -9]],
];
export const tracks: P[][] = [
  // the road west from the access road's bend (it fades into the fields)
  [[-378, -162], [-400, -168], [-430, -178]],
  // round the farmyard on its banks
  [[-30, 70], [0, 72], [40, 72], [80, 72], [100, 66], [110, 48], [114, 20], [117, -20], [117, -50], [112, -70], [100, -80], [60, -75],
    [20, -70], [-20, -63], [-60, -56], [-90, -51], [-112, -47]],
];

/** The entrance gate (porteira): the white gate across the access road just past its bend, seen at the bottom of photo 0028 (found by
 *  projecting the photo: camera about 24° down). `a` = the road's direction there, degrees counter-clockwise from east. */
export const porteira = { at: [-371.6, -149.2] as P, a: 56.6 };

/** Oriented rectangle: centre, length along `a`, width across, `a` = degrees counter-clockwise from east. */
export type Rect = { c: P; L: number; W: number; a: number };
// the sheds share one axis (32.4° south of east), measured from the centre of the main shed
const AXIS = { c: [23.25, -4.5] as P, a: -32.4 };
function along(u0: number, u1: number, v0: number, v1: number): Rect {
  const t = (AXIS.a * Math.PI) / 180, u = [Math.cos(t), Math.sin(t)], v = [-u[1], u[0]];
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2;
  return { c: [AXIS.c[0] + u[0] * cu + v[0] * cv, AXIS.c[1] + u[1] * cu + v[1] * cv], L: u1 - u0, W: v1 - v0, a: AXIS.a };
}

export type Building = Rect & {
  id: string;
  /** ridge lines along the length, as fractions of the width from the centre (0 = middle); `vale` = valley (dashed) */
  cumeeira?: number[];
  vale?: number[];
};
export const buildings: Building[] = [
  // the old brickworks: main shed (two roofs side by side), the red-roofed part and its lean-to, the south-east shed
  { id: 'galpao', ...along(-32.6, 32.6, -21.6, 21.6), cumeeira: [-0.25, 0.25], vale: [0] },
  { id: 'galpao-v', ...along(32.6, 56.95, -8.25, 14.25), cumeeira: [0] },
  { id: 'galpao-p', ...along(32.6, 56, -20, -8.25) },
  { id: 'galpao-se', ...along(59.4, 90.7, -11.1, 12.4), cumeeira: [0] },
  // the old house, about a hundred years old (owner), by the road, and its annex
  { id: 'casa-antiga', c: [-71.35, 51], L: 7.65, W: 10.85, a: -4.4 },
  { id: 'casa-antiga-a', c: [-70, 42.5], L: 9, W: 6, a: -4 },
  // the two-storey house (red roof, owner) and its annex, the long white roof beside it, small sheds
  { id: 'casa', c: [-36.9, 19.85], L: 8.9, W: 14.5, a: -1.75 },
  { id: 'casa-a', c: [-36.9, 7], L: 7.5, W: 9, a: -2 },
  { id: 'estufa', c: [-51.65, 25.4], L: 15, W: 4.75, a: -4 },
  { id: 'branca', c: [-52.15, 18.5], L: 7.65, W: 4.5, a: -3.4 },
  { id: 'laranja', c: [-43.75, 51.25], L: 4, W: 4, a: -4 },
  { id: 'cabanha', c: [-68.5, -38], L: 23, W: 9.5, a: -4 },   // the sheep shed
  { id: 'oficina', c: [-39.5, -37.5], L: 11, W: 11, a: -2 },   // workshop (owner)
  { id: 'garagem', c: [-29, -37.5], L: 10, W: 11, a: -2 },   // garage (owner)
  { id: 'casinha', c: [-3.6, 77.6], L: 10.75, W: 6.25, a: -3.6 },
  { id: 'galpao-no', c: [-116, 73], L: 15, W: 5, a: 18 },
];

/**
 * Labels. k: 'nome' (names, with a minimum size on screen), 'medida' (sizes and areas, drawn to scale), 'lugar' (river, fields: italic),
 * 'via' (on the highway), 'rumo' (the way to a town). `area` / `dim` fill in a measure computed from the drawing. a = degrees
 * counter-clockwise. `seta`: an arrow beside the text, pointing that many degrees counter-clockwise from the text's baseline (180 = back
 * along it); `at` is then the arrow's centre, and the text runs away from where it points.
 */
export type Label = { t: string; at: P; k: 'nome' | 'medida' | 'lugar' | 'via' | 'rumo'; a?: number; anchor?: 'start' | 'end'; seta?: number };
export const labels: Label[] = [
  { t: 'Galpão', at: [38, -12], k: 'nome', a: -32.4 },
  { t: '{dim:galpao}', at: [34.8, -17.1], k: 'medida', a: -32.4 },
  { t: 'Galpão', at: [75, -33.5], k: 'nome', a: -32.4 },
  { t: '{dim:galpao-se}', at: [71.8, -38.6], k: 'medida', a: -32.4 },
  { t: 'Casa centenária', at: [-71.35, 61], k: 'nome' },
  { t: 'Casa · 2 andares', at: [-46, 4.5], k: 'nome', anchor: 'end' },
  { t: 'Cabanha', at: [-64, -27.5], k: 'nome' },   // the shed south-east of the açude (owner)
  // the two beside it: workshop under, garage to the right (the names would run into each other side by side)
  { t: 'Oficina', at: [-39.5, -48.5], k: 'nome' },
  { t: 'Garagem', at: [-22, -37.5], k: 'nome', anchor: 'start' },
  { t: 'Açude', at: [-113, 24], k: 'nome' },
  { t: '{area:acude}', at: [-113, 18.5], k: 'medida' },
  { t: 'Tanques', at: [33, 57], k: 'nome' },
  { t: '{area:tanques}', at: [33, 51.5], k: 'medida' },
  { t: 'Campo', at: [-40, 125], k: 'lugar' },
  { t: 'Campo', at: [-235, 85], k: 'lugar' },
  { t: 'Campo', at: [-225, -45], k: 'lugar' },
  { t: 'Rio Gravataí', at: [-445, 136], k: 'lugar', a: 4 },
  { t: 'Rio Gravataí', at: [-215, 178], k: 'lugar', a: 11 },
  { t: 'Porteira de entrada', at: [-362, -151], k: 'nome', anchor: 'start' },
  // the highway (on its central barrier, along it) and the ways to the towns (owner: Porto Alegre 20 min west, at the west end of the
  // highway in the frame; Gravataí 3 km, whose centre lies north-east, across the river and the highway, bearing about 47°: on the open
  // ground of the neighbours' houses, east). Both lie outside the strip phones show first; they come in when the plan is panned.
  { t: 'BR-290 · Freeway', at: [40, 297.4], k: 'via', a: 12.6 },
  { t: 'Porto Alegre a 20 min', at: [-472, 206.6], k: 'via', a: 6.8, seta: 180 },
  { t: 'Gravataí a 3 km', at: [338, 258], k: 'rumo', seta: 43 },
];

/**
 * Where each photo was taken (drone GPS), which way it looks (gimbal yaw + 4.6°, the compass correction found above; degrees clockwise
 * from north) and how high (m). Keyed by the number in Favretto-00NN.jpg. 0049 and 0059 look straight down: their points are where the
 * fit to the satellite puts the spot under the drone (GPS was a few metres off). 0083 is inside the main shed.
 */
export const fotos: Record<string, { at: P; az: number; h: number; down?: true }> = {
  '0023': { at: [-275, 318.5], az: 146, h: 86 },
  '0059': { at: [-39.3, 186.2], az: 77.2, h: 373, down: true },
  '0028': { at: [-469.9, -218.2], az: 51.7, h: 125 },
  '0040': { at: [43.5, -245], az: -6.5, h: 120 },
  '0041': { at: [-98.2, -211.3], az: 22.5, h: 120 },
  '0067': { at: [37.8, -220.1], az: -13.8, h: 109 },
  '0049': { at: [-2.3, 8.5], az: 1.7, h: 226, down: true },
  '0071': { at: [191.6, 35.2], az: -99.4, h: 113 },
  '0075': { at: [117.7, -86.3], az: -43.7, h: 46 },
  '0078': { at: [96.7, -102.4], az: -31.3, h: 39 },
  '0088': { at: [-162.2, 104.2], az: 167.4, h: 25 },
  '0099': { at: [-70.6, 119.2], az: -171, h: 26 },
  '0083': { at: [7.9, 3.6], az: 183.9, h: 2.5 },
};
