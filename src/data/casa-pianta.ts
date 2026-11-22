// Floor plan of /casa/: the rooms (for floor tints and, later, the render viewpoints) and the project's revisions.
// The drawing itself (land, walls, doors, dimensions) is src/data/casa-pianta-base.ts, read-only. Same frame: cm, origin top-left, y down.
// Rendered by src/lib/casa-pianta.ts (page: SVG in two orientations; download: /casa/pianta.pdf at 1:100 on A3).
import type { Linea, Testo } from './casa-pianta-base';

/** A space of the plan. poly = inner faces of its walls [x, y, x, y…]; est = outdoors. nome = the name on the drawing, if any. */
export type Ambiente = { id: string; nome?: string; est?: true; poly: number[] };
export const ambienti: Ambiente[] = [
  { id: 'camera', nome: 'Camera', poly: [939.8, 134.8, 1307, 121.4, 1307, 491.1, 938, 503.8] },
  { id: 'wc-camera', nome: 'Wc', poly: [1337, 119.9, 1457.3, 115.7, 1457.3, 389.8, 1337.4, 390.2] },
  { id: 'hall', nome: 'Hall', poly: [938, 528.8, 1337.4, 515.1, 1337.4, 405, 1457.3, 405, 1457, 631.1, 937.7, 648.8] },
  { id: 'soggiorno', nome: 'Soggiorno', poly: [937.7, 675.6, 1456.3, 658.3, 1457, 851.6, 1251.3, 852.3, 1252.7, 1068.2, 935.9, 1091.1] },
  { id: 'wc-soggiorno', nome: 'WC', poly: [1267.2, 866.8, 1457.3, 866.4, 1458, 1053.4, 1267.9, 1067.2] },
  { id: 'cucina', nome: 'Cucina', poly: [1487.7, 689, 1862.7, 670.3, 1860.9, 1031.5, 1487.7, 1057.6] },
  { id: 'sgombero', nome: 'Sgombero', poly: [1897.9, 699.2, 2269.8, 684.4, 2269.8, 1014.6, 1895.8, 1029.1] },
  // the space behind the Wc and the Hall (+2.10) and the one with the oven (+3.10), split where the level changes
  { id: 'ambiente-210', poly: [1487.3, 126.6, 1880.7, 121.7, 1885.6, 294.6, 1888.4, 383.1, 1895.8, 641.4, 1801.6, 646.3, 1487, 662.2] },
  { id: 'forno', poly: [1880.7, 121.7, 2244.4, 117.5, 2252.1, 396.9, 2283.9, 454.7, 2288.8, 528.1, 2443.3, 526, 2429.2, 662.2, 2289.9, 663.6, 2119.8, 670.3, 1897.9, 679.1, 1895.8, 641.4, 1888.4, 383.1, 1885.6, 294.6] },
  { id: 'giardino', est: true, poly: [131.2, 139, 904.9, 130.9, 901, 1115.8, 659, 1125.7, 639.9, 1091.1, 525.6, 846] },
  { id: 'cortile', est: true, poly: [2289.9, 663.6, 2360.1, 662.5, 2360.4, 677, 2409.5, 677, 2455, 856.5, 2346.7, 862.2, 2347.4, 880.2, 2438, 875.6, 2434.9, 998.4, 2289.9, 1010.7] },
  { id: 'terreno', est: true, poly: [2274, 99.5, 3530.2, 173.2, 3818.5, 881.9, 2453.2, 997, 2455.7, 874.5, 2493.1, 872.4, 2439.5, 662.2, 2455.7, 503.1, 2287.4, 504.8, 2283.9, 454.7] },
];

/** Compass on the page (the PDF keeps the rose of the original): centre and radius, in an empty corner of the land. */
export const BUSSOLA = { x: 3670, y: 1105, r: 52 };

/**
 * A change to the project. togli = ids of casa-pianta-base.ts (or of an earlier revision) that go; linee/testi = what comes in.
 * The page and the PDF show the last revision; stato(id) in src/lib/casa-pianta.ts rebuilds any earlier one.
 */
export type Revisione = { id: string; data: string; titolo: string; togli: string[]; linee?: Record<string, Linea>; testi?: Record<string, Testo> };

export const revisioni: Revisione[] = [
  {
    id: 'r1',
    data: '2026-11-21',
    titolo: 'Porta del WC sul soggiorno; scala dal soggiorno alla cucina',
    togli: [
      // WC → cucina door: leaf, swing, jambs, sills, size label
      'p425', 'p426', 'p431', 'p432', 'p433', 'p435', 'p436', 'p504', 't92', 't93',
      // wall faces cut by the new openings (redrawn below)
      'p34', 'p35', 'p51', 'p427', 'p430',
      // dimensions and the WC label in the way of the new door (moved below)
      't67', 't71', 't74', 't75',
    ],
    linee: {
      // old door closed: the WC face and the cucina face of the wall run through
      'r1-wc-chiusura': ['m', 'M1457.7 971.5L1458 1047.4'],
      // soggiorno ↔ cucina wall, cut by the stair's opening (689.1–779.1, the top end of the wall, square with the cucina's north wall)
      'r1-muro-sog-a': ['m', 'M1456.6 689.1L1456.2 658.2L1266.2 664.5L1138.5 668.9'],
      'r1-muro-sog-b': ['m', 'M1456.9 779.1L1457.1 851.4'],
      'r1-muro-cuc': ['m', 'M1487.7 779.1L1487.8 1051.3'],
      // stair soggiorno (+1.10) → cucina (+2.20): 6 risers of 18.3 cm, 5 treads of 28 cm, 90 cm wide, at the far end from the WC
      'r1-scala-gradini': ['d', 'M1316.9 689.1L1316.9 779.1M1344.9 689.1L1344.9 779.1M1372.9 689.1L1372.9 779.1M1401 689.1L1401 779.1M1429 689.1L1429 779.1M1316.9 689.1L1456.6 689.1M1316.9 779.1L1456.9 779.1'],
      'r1-scala-linea': ['d', 'M1316.9 734.1L1454.9 734.1'],
      'r1-scala-freccia': ['d', 'M1440 712.2L1455.6 734.1L1440 756'],
      // door at the top of the stair (90/220), hinged in the cucina's corner, opens into the cucina and folds back on its north wall
      'r1-scala-stip': ['s', 'M1456.6 689.1L1487.7 689.1M1456.9 779.1L1487.7 779.1'],
      'r1-scala-soglia': ['s', 'M1456.6 689.1L1456.9 779.1M1487.7 689.1L1487.7 779.1'],
      'r1-scala-anta': ['s', 'M1487.7 689.1L1577.6 689.1M1487.7 693.4L1577.6 693.4'],
      'r1-scala-arco': ['s', 'M1577.6 689.1C1577.6 738.8 1537.4 779.1 1487.7 779.1'],
      'r1-scala-quota': ['m', 'M1487.7 734.1L1530.7 734.1'],
      // new WC door (80/220) in the partition on the soggiorno, by the outer wall, opens into the WC
      'r1-tram-sog-a': ['m', 'M1251.7 852.3L1252.4 978.6'],
      'r1-tram-sog-b': ['m', 'M1252.4 1058.3L1252.7 1068.2'],
      'r1-tram-wc-a': ['m', 'M1267.9 1067.2L1267.9 1058.3'],
      'r1-tram-wc-b': ['m', 'M1267.5 978.6L1267.2 867.1L1457.3 866.4'],
      'r1-wc-stip': ['s', 'M1252.4 978.6L1267.5 978.6M1252.4 1058.3L1267.9 1058.3'],
      'r1-wc-soglia': ['s', 'M1252.4 978.6L1252.4 1058.3M1267.5 978.6L1267.9 1058.3'],
      'r1-wc-anta': ['s', 'M1267.9 1058.3L1347.6 1058.3M1267.9 1054.1L1347.6 1054.1'],
      'r1-wc-arco': ['s', 'M1347.6 1058.3C1347.6 1014.3 1311.9 978.6 1267.9 978.6'],
      'r1-wc-quota': ['m', 'M1252.4 1018.5L1209.3 1018.5'],
    },
    testi: {
      'r1-scala-90': ['frac', '90', 1510.6, 732.3, 0],
      'r1-scala-220': ['frac', '220', 1510.6, 749.2, 0],
      'r1-wc-80': ['frac', '80', 1229.4, 1016.7, 0],
      'r1-wc-220': ['frac', '220', 1229.4, 1033.6, 0],
      'r1-403': ['dim', '403', 1244.5, 922.5, -90],
      'r1-200': ['dim', '200', 1291.8, 922.5, -90],
      'r1-wc-nome': ['room', 'WC', 1375.7, 967.8, 0],
      'r1-wc-mq': ['mq', 'mq 3.67', 1368.3, 1000, 0],
    },
  },
  {
    id: 'r2',
    data: '2026-11-21',
    titolo: 'Sgombero: chiusa la finestra sul cortile; lucernario',
    togli: [
      // window 275/90 in the east wall: jambs, sills, glazing, size label
      'p574', 'p575', 'p576', 'p577', 'p578', 'p579', 'p580', 't95', 't96',
      // room name and area, moved left to make room for the roof window
      't87', 't88',
    ],
    linee: {
      // the wall runs through
      'r2-muro-int': ['m', 'M2269.7 713.6L2269.7 990.1'],
      'r2-muro-est': ['m', 'M2289.7 713.6L2289.7 990.1'],
      // roof window, the same as the WC's (wc-lucernario, 85 × 60), towards the east wall
      'r2-lucernario': ['t', 'M2157.5 827L2242.5 827L2242.5 887L2157.5 887ZM2162.4 832L2237.5 832L2237.5 882.1L2162.4 882.1Z'],
    },
    testi: {
      'r2-nome': ['room', 'Sgombero', 2038.7, 858.6, 0],
      'r2-mq': ['mq', 'mq 12.30', 2033.2, 890.8, 0],
    },
  },
  {
    id: 'r3',
    data: '2026-11-22',
    titolo: 'Soggiorno: tolta la superficie, resta "mq"',
    togli: ['t91'],   // 'mq 12.90'
    testi: {
      'r3-mq': ['mq', 'mq', 1094.2, 920.5, 0],   // under the name, which is centred at 1094.2
    },
  },
];
