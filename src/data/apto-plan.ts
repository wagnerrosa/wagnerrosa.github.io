// Floor plan of /apto/. Geometry traced from the Figma sketch (apto-src/apto-planta-1.jpg) and checked against the photos.
// Units: plan units, about 1 cm each (the 76,33 m² footprint is 1242 × 580). Origin top-left, y down.
// Orientation of the drawing: the bedrooms' windows (left) face east and the living room's (bottom) faces north, so N points down.
// Rendered by src/lib/plan-svg.ts (page: two orientations + the viewer's mini map; file: /apto/planta.svg).

export const PLAN = { w: 1242, h: 580 };
export const NORTH = 90;   // direction of north on the drawing, degrees (0 = right, 90 = down)

// g = photo group (scripts/apto-photos.mjs GROUPS): the room links to its photos. count: false = no photo count on the label.
// vert: label runs along the room on the upright (phone) plan, where the room is too narrow for it.
export type Room = { id: string; g?: string; label: string[]; x: number; y: number; w: number; h: number; floor: 'wood' | 'tile'; lx?: number; ly?: number; count?: false; vert?: true };
export const rooms: Room[] = [
  { id: 'quarto', g: 'quarto', label: ['Quarto'], x: 0, y: 0, w: 305, h: 371, floor: 'wood' },
  { id: 'dependencia', g: 'dependencia', label: ['Dependência'], x: 305, y: 0, w: 259, h: 261, floor: 'wood', lx: -30, ly: 10 },
  { id: 'area-servico', g: 'area-servico', label: ['Área de', 'serviço'], x: 564, y: 0, w: 216, h: 171, floor: 'tile', ly: -10 },
  { id: 'wc-servico', g: 'area-servico', label: ['WC'], x: 564, y: 171, w: 216, h: 90, floor: 'tile', lx: 50, count: false },
  { id: 'cozinha', g: 'cozinha', label: ['Cozinha'], x: 780, y: 0, w: 462, h: 261, floor: 'tile', lx: 20 },
  { id: 'corredor', g: 'corredor', label: ['Corredor'], x: 305, y: 261, w: 342, h: 110, floor: 'wood', lx: -20, vert: true },
  { id: 'escritorio', g: 'escritorio', label: ['Escritório'], x: 0, y: 371, w: 432, h: 209, floor: 'wood', lx: -20 },
  { id: 'banheiro', g: 'banheiro', label: ['Banheiro'], x: 432, y: 371, w: 215, h: 209, floor: 'tile', ly: 30 },
  { id: 'sala', g: 'sala', label: ['Sala'], x: 647, y: 261, w: 485, h: 319, floor: 'wood' },
];
// Footprint (exterior wall). The notch on the right is the building's hall, where the front door is.
export const outline: [number, number][] = [[0, 0], [1242, 0], [1242, 261], [1132, 261], [1132, 580], [0, 580]];

// A wall segment: horizontal (dir 'h', y = at, x from → to) or vertical (dir 'v', x = at, y from → to).
export type Seg = { dir: 'h' | 'v'; at: number; from: number; to: number };
// hinge: which end the leaf turns on. swing: side it opens to (+1 = towards +y for 'h', +x for 'v').
export type Door = Seg & { hinge: 'from' | 'to'; swing: 1 | -1 };
export const doors: Door[] = [
  { dir: 'v', at: 1132, from: 268, to: 358, hinge: 'from', swing: -1 },   // front door (hall → sala)
  { dir: 'v', at: 647, from: 268, to: 358, hinge: 'to', swing: -1 },      // sala ↔ corredor
  { dir: 'v', at: 305, from: 268, to: 358, hinge: 'to', swing: -1 },      // corredor → quarto
  { dir: 'h', at: 371, from: 319, to: 409, hinge: 'to', swing: 1 },       // corredor → escritório
  { dir: 'h', at: 371, from: 495, to: 585, hinge: 'to', swing: 1 },       // corredor → banheiro
  { dir: 'h', at: 261, from: 319, to: 409, hinge: 'from', swing: -1 },    // corredor → dependência
  { dir: 'v', at: 564, from: 71, to: 161, hinge: 'from', swing: -1 },     // área de serviço → dependência
  { dir: 'v', at: 780, from: 71, to: 161, hinge: 'from', swing: 1 },      // área de serviço ↔ cozinha
  { dir: 'h', at: 171, from: 592, to: 662, hinge: 'to', swing: 1 },      // área de serviço → WC (narrower door)
];
export type Win = Seg & { small?: boolean };
export const windows: Win[] = [
  { dir: 'v', at: 0, from: 92, to: 241 },          // quarto (east)
  { dir: 'v', at: 0, from: 401, to: 550 },         // escritório (east)
  { dir: 'h', at: 580, from: 345, to: 405, small: true },   // escritório, small barred window (photos 22, 24, 29)
  { dir: 'h', at: 0, from: 375, to: 495 },         // dependência
  { dir: 'h', at: 0, from: 619, to: 739 },         // área de serviço
  { dir: 'h', at: 0, from: 847, to: 967 },         // cozinha
  { dir: 'h', at: 0, from: 1052, to: 1172 },       // cozinha
  { dir: 'h', at: 580, from: 480, to: 600 },       // banheiro (in the shower)
  { dir: 'h', at: 580, from: 764, to: 1017 },      // sala (north)
];
// Openings without a door: kitchen and living room are one space (photos 05, 06); a dashed line marks the change of floor.
export const openings: Seg[] = [{ dir: 'h', at: 261, from: 800, to: 1112 }];

// Hall (outside the flat): entrance arrow and compass live here.
export const hall = { entrance: [1132, 313] as [number, number], compass: [1187, 505] as [number, number], label: [1187, 368] as [number, number] };

// Where each photo was taken: file stem (public/apto/photos.json) → [x, y, direction°] on this plan (0 = right, 90 = down).
// Estimated from the photos; tweak freely. Photos missing here (condomínio, garagem, salão) show no marker.
export const shots: Record<string, [number, number, number]> = {
  '01-sala': [960, 290, 90],
  '02-sala': [880, 470, 80],
  '03-sala': [790, 295, 70],
  '04-sala-cozinha': [870, 545, 285],
  '05-cozinha-sala': [960, 110, 100],
  '06-sala-corredor-cozinha': [1100, 340, 180],
  '07-sala-corredor': [950, 430, 200],
  '08-sala-porta-entrada': [930, 360, 355],
  '09-cozinha': [815, 190, 0],
  '10-cozinha': [805, 120, 10],
  '11-cozinha': [1010, 235, 270],
  '12-corredor': [325, 316, 0],
  '13-corredor': [695, 316, 180],
  '14-quarto-video': [285, 330, 195],
  '15-quarto': [130, 335, 280],
  '16-quarto': [250, 280, 190],
  '17-quarto': [190, 345, 268],
  '18-quarto': [165, 285, 270],
  '19-quarto': [285, 295, 185],
  '20-quarto': [230, 350, 240],
  '21-escritorio': [200, 560, 275],
  '22-escritorio': [120, 470, 10],
  '23-escritorio': [330, 400, 115],
  '24-escritorio': [295, 405, 95],
  '25-escritorio': [90, 505, 350],
  '26-escritorio': [115, 480, 0],
  '27-escritorio': [100, 530, 345],
  '28-escritorio': [60, 460, 340],
  '29-escritorio': [265, 425, 85],
  '30-banheiro': [545, 395, 90],
  '31-banheiro': [565, 400, 100],
  '32-banheiro': [525, 410, 85],
  '33-banheiro': [580, 470, 185],
  '34-banheiro': [560, 530, 95],
  '35-banheiro-corredor': [600, 545, 260],
  '36-banheiro-corredor': [570, 555, 270],
  '37-empregada-video': [364, 282, 284],
  '38-empregada': [420, 235, 270],
  '39-empregada': [445, 240, 272],
  '40-empregada': [470, 232, 268],
  '41-empregada': [420, 116, 0],
  '42-empregada-area-servico': [360, 170, 340],
  '43-area-servico-empregada': [740, 120, 185],
  '44-area-servico': [700, 150, 285],
  '45-area-servico': [830, 116, 180],
  '46-area-servico': [745, 150, 225],
  '47-area-servico': [680, 150, 270],
  '48-area-servico': [660, 155, 275],
  '49-area-servico': [610, 40, 85],
  '50-area-servico': [610, 150, 300],
};
