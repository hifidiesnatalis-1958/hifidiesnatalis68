import defaults from '@/content/site.json';
import {backend,backendReady} from '@/lib/backend.js';
import {json} from '@/lib/http.js';
export async function GET() {
  if (!backendReady()) return json({content:defaults});
  try {return json({content:{...defaults,...await backend('content.get')}});}
  catch {return json({content:defaults});}
}
