const base = process.env.API_URL || 'http://localhost:8787';
const r = await fetch(`${base}/health`);
const body = await r.json();
console.log(JSON.stringify(body,null,2));
if (!body.ok || body.db !== true) process.exit(1);
