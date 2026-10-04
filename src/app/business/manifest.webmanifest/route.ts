import {businessManifest} from '@/lib/business-manifest';
export function GET(){return Response.json(businessManifest,{headers:{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}});}
