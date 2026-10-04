// Run from huroner-platformer after npm run build; BASE_URL points to a server of repository root.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const runs=[];
for(const file of ['browser-route.mjs','browser-cases.mjs']){
 const run=spawnSync(process.execPath,[`tests/${file}`],{stdio:'inherit',env:process.env,timeout:360000});
 runs.push({file,status:run.status,error:run.error?.message});
}
fs.writeFileSync('test-results/summary.json',JSON.stringify(runs,null,2));
console.log('QA SUMMARY',JSON.stringify(runs));
if(runs.some(r=>r.status!==0))process.exitCode=1;
