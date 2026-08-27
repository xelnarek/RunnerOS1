import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

if (!fs.existsSync('server/node_modules/pg')) {
  console.log(JSON.stringify({ok:true,skipped:true,reason:'server dependencies are not installed; run npm install --prefix server first'},null,2));
  process.exit(0);
}

const port = Number(process.env.VERIFY_PORT || 8899);
const env = {...process.env, PORT:String(port), DATABASE_URL:'', JWT_SECRET:'runneros-test-secret'};
const child = spawn(process.execPath, ['server/index.mjs'], {cwd:process.cwd(), env, stdio:['ignore','pipe','pipe']});
let output=''; child.stdout.on('data',d=>output+=d); child.stderr.on('data',d=>output+=d);
const get = path => new Promise((resolve,reject)=>{
  const req=http.get(`http://127.0.0.1:${port}${path}`, res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(b)}));});
  req.on('error',reject);
});
try {
  await new Promise(r=>setTimeout(r,500));
  const health=await get('/health');
  if (!health.body.ok || health.body.version !== '1.7.0') throw new Error(`health failed: ${JSON.stringify(health.body)}`);
  const auth=await get('/v1/me').catch(e=>({status:0,body:{}}));
  if (auth.status !== 401) throw new Error(`auth guard failed: ${auth.status}`);
  console.log(JSON.stringify({ok:true,health:health.body,unauthorizedStatus:auth.status},null,2));
} catch (error) { console.error(output); throw error; } finally { child.kill('SIGTERM'); }
