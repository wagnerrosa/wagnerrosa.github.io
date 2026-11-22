// /casa/pianta.pdf: the floor plan of /casa/ (last revision) on an A3 sheet at 1:100, built at build time. See src/lib/casa-pianta.ts.
import { piantaPdf } from '../../lib/casa-pianta';

export const GET = () => new Response(piantaPdf(), { headers: { 'Content-Type': 'application/pdf' } });
