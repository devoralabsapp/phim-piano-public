import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
it('production policy permits Firebase OAuth helper, frames and API traffic without inline scripts',()=>{
 const config=JSON.parse(readFileSync('vercel.json','utf8'));
 const headers=config.headers[0].headers as {key:string,value:string}[];
 const csp=headers.find(h=>h.key==='Content-Security-Policy')!.value;
 const directives=Object.fromEntries(csp.split(';').map(d=>d.trim().split(/\s+/)).map(([key,...origins])=>[key,origins]));
 expect(directives['script-src']).toContain('https://apis.google.com');
 expect(directives['script-src']).not.toContain("'unsafe-inline'");
 expect(directives['script-src']).not.toContain("'unsafe-eval'");
 expect(directives['frame-src']).toContain('https://*.firebaseapp.com');
 for(const origin of ['https://identitytoolkit.googleapis.com','https://securetoken.googleapis.com','https://firestore.googleapis.com'])expect(directives['connect-src']).toContain(origin);
 expect(headers.find(h=>h.key==='Cross-Origin-Opener-Policy')?.value).toBe('same-origin-allow-popups');
});
