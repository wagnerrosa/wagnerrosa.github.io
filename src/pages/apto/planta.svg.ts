// /apto/planta.svg: the floor plan as a standalone file (download link on /apto/, or to attach to a listing).
import { planFile } from '../../lib/plan-svg';

export const GET = () => new Response(planFile(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
