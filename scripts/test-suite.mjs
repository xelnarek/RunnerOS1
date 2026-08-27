import { spawnSync } from 'node:child_process';
const checks = [
  [process.execPath,['--check','server/index.mjs'],'server syntax'],
  [process.execPath,['--check','scripts/smoke-api.mjs'],'smoke script syntax'],
  [process.execPath,['--check','scripts/preflight.mjs'],'preflight syntax'],
  [process.execPath,['--check','scripts/verify-server.mjs'],'verify-server syntax']
];
for (const [cmd,args,name] of checks) {
  const r=spawnSync(cmd,args,{encoding:'utf8'});
  if(r.status!==0){console.error(`${name} FAILED\n${r.stderr||r.stdout}`);process.exit(1);}
  console.log(`✓ ${name}`);
}
console.log('Static verification passed. Full npm/Android build requires dependencies and Android SDK.');
