import http from 'node:http';
import crypto from 'node:crypto';
import { Pool } from 'pg';

const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const ACCESS_TTL_SEC = 60 * 60;
const APP_VERSION = '1.7.0';
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

const json = (res, status, body, headers={}) => {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':process.env.CORS_ORIGIN||'*', 'Access-Control-Allow-Headers':'Content-Type, Authorization', 'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS', ...headers });
  res.end(JSON.stringify(body));
};
const readBody = req => new Promise((resolve,reject)=>{let b=''; req.on('data',c=>{b+=c; if(b.length>2_000_000){req.destroy(); reject(new Error('body too large'));}}); req.on('end',()=>{try{resolve(b?JSON.parse(b):{});}catch(e){reject(new Error('invalid json'));}}); req.on('error',reject)});
const b64 = v => Buffer.from(JSON.stringify(v)).toString('base64url');
function signJwt(payload){const head=b64({alg:'HS256',typ:'JWT'}); const body=b64(payload); const sig=crypto.createHmac('sha256',JWT_SECRET).update(`${head}.${body}`).digest('base64url'); return `${head}.${body}.${sig}`;}
function verifyJwt(token){try{const [h,p,s]=token.split('.'); if(!h||!p||!s) return null; const exp=crypto.createHmac('sha256',JWT_SECRET).update(`${h}.${p}`).digest('base64url'); if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(exp))) return null; const payload=JSON.parse(Buffer.from(p,'base64url')); if(payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null; return payload;}catch{return null;}}
function hashPassword(password){const salt=crypto.randomBytes(16); const digest=crypto.pbkdf2Sync(password,salt,120000,32,'sha256'); return `${salt.toString('hex')}:${digest.toString('hex')}`;}
function verifyPassword(password, stored){try{const [saltHex,digestHex]=stored.split(':'); const digest=crypto.pbkdf2Sync(password,Buffer.from(saltHex,'hex'),120000,32,'sha256').toString('hex'); return crypto.timingSafeEqual(Buffer.from(digest,'hex'),Buffer.from(digestHex,'hex'));}catch{return false;}}
function auth(req){const h=req.headers.authorization||''; return h.startsWith('Bearer ')?verifyJwt(h.slice(7)):null;}
function requireDb(){if(!pool) throw Object.assign(new Error('DATABASE_URL is not configured'),{status:503}); return pool;}
async function query(text,params){return requireDb().query(text,params);}
function pointArrayToWkt(points=[]){const valid=points.filter(p=>Number.isFinite(p.lng)&&Number.isFinite(p.lat)); if(valid.length<2)return null; return `LINESTRING(${valid.map(p=>`${p.lng} ${p.lat}`).join(',')})`;}
function activityPayload(row){return {...(row.payload||{}),id:row.id};}

async function route(req,res){
  if(req.method==='OPTIONS') return json(res,204,{});
  if(req.method==='GET' && new URL(req.url,`http://${req.headers.host||'localhost'}`).pathname==='/health'){
    if(!pool) return json(res,200,{ok:true,db:false,version:APP_VERSION});
    try { const r=await pool.query("SELECT 1, EXISTS(SELECT 1 FROM pg_extension WHERE extname='postgis') AS postgis"); return json(res,200,{ok:true,db:true,postgis:Boolean(r.rows[0]?.postgis),version:APP_VERSION}); } catch { return json(res,200,{ok:true,db:false,postgis:false,version:APP_VERSION}); }
  }
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`); const path=url.pathname;
  try {
    if(req.method==='POST' && path==='/v1/auth/register'){
      const {email,password,name}=await readBody(req); if(typeof email!=='string'||typeof password!=='string'||typeof name!=='string'||password.length<8) return json(res,400,{error:'email, name and password>=8 required'});
      const normalized=email.trim().toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return json(res,400,{error:'invalid_email'}); const r=await query('INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id,email,name,avatar_url,created_at',[normalized,hashPassword(password),name.trim()]);
      const u=r.rows[0]; const token=signJwt({sub:u.id,email:u.email,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+ACCESS_TTL_SEC}); return json(res,201,{user:{id:u.id,name:u.name,email:u.email,avatarUrl:u.avatar_url||undefined},token});
    }
    if(req.method==='POST' && path==='/v1/auth/login'){
      const {email,password}=await readBody(req);
      if(typeof email!=='string'||typeof password!=='string') return json(res,400,{error:'email_and_password_required'}); const r=await query('SELECT id,email,name,avatar_url,password_hash FROM users WHERE email=$1',[String(email||'').trim().toLowerCase()]); const u=r.rows[0]; if(!u||!verifyPassword(String(password||''),u.password_hash)) return json(res,401,{error:'invalid credentials'});
      const token=signJwt({sub:u.id,email:u.email,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+ACCESS_TTL_SEC}); return json(res,200,{user:{id:u.id,name:u.name,email:u.email,avatarUrl:u.avatar_url||undefined},token});
    }
    const me=auth(req); if(!me) return json(res,401,{error:'unauthorized'});
    if(req.method==='GET'&&path==='/v1/me'){const r=await query('SELECT id,email,name,avatar_url FROM users WHERE id=$1',[me.sub]); if(!r.rows[0]) return json(res,401,{error:'user_not_found'}); const u=r.rows[0]; return json(res,200,{user:{id:u.id,name:u.name,email:u.email,avatarUrl:u.avatar_url||undefined}});}
    if(req.method==='POST'&&path==='/v1/activities'){
      const a=await readBody(req); const points=Array.isArray(a.points)?a.points:[]; const wkt=pointArrayToWkt(points); const id=a.id||crypto.randomUUID();
      const baseParams=[id,me.sub,Number(a.startedAt),Number(a.endedAt||a.startedAt),Number(a.distanceM||0),Number(a.movingSec||0),Number(a.elevationGainM||0)];
      let sql, params;
      if(wkt){
        sql=`INSERT INTO activities(id,user_id,started_at,ended_at,distance_m,moving_sec,elevation_gain_m,track,payload)
          VALUES($1,$2,to_timestamp($3/1000.0),to_timestamp($4/1000.0),$5,$6,$7,ST_GeomFromText($8,4326),$9::jsonb)
          ON CONFLICT(id) DO UPDATE SET ended_at=EXCLUDED.ended_at,distance_m=EXCLUDED.distance_m,moving_sec=EXCLUDED.moving_sec,elevation_gain_m=EXCLUDED.elevation_gain_m,track=EXCLUDED.track,payload=EXCLUDED.payload,updated_at=now()
          RETURNING id`;
        params=[...baseParams,wkt,a];
      } else {
        sql=`INSERT INTO activities(id,user_id,started_at,ended_at,distance_m,moving_sec,elevation_gain_m,track,payload)
          VALUES($1,$2,to_timestamp($3/1000.0),to_timestamp($4/1000.0),$5,$6,$7,NULL,$8::jsonb)
          ON CONFLICT(id) DO UPDATE SET ended_at=EXCLUDED.ended_at,distance_m=EXCLUDED.distance_m,moving_sec=EXCLUDED.moving_sec,elevation_gain_m=EXCLUDED.elevation_gain_m,track=EXCLUDED.track,payload=EXCLUDED.payload,updated_at=now()
          RETURNING id`;
        params=[...baseParams,a];
      }
      const r=await query(sql,params); return json(res,201,{ok:true,id:r.rows[0].id});
    }
    if(req.method==='GET'&&path==='/v1/feed'){
      const r=await query(`SELECT a.id,a.user_id,a.started_at,a.ended_at,a.distance_m,a.moving_sec,a.elevation_gain_m,a.payload,u.name,u.avatar_url
        FROM activities a JOIN users u ON u.id=a.user_id
        WHERE a.user_id=$1 OR a.user_id IN (SELECT followee_id FROM follows WHERE follower_id=$1)
        ORDER BY a.started_at DESC LIMIT 50`,[me.sub]);
      return json(res,200,r.rows.map(x=>({...activityPayload(x),user:{id:x.user_id,name:x.name,avatarUrl:x.avatar_url||undefined}})));
    }
    const followMatch=path.match(/^\/v1\/users\/([0-9a-f-]+)\/follow$/i);
    if(followMatch&&(req.method==='POST'||req.method==='DELETE')){const id=followMatch[1]; if(id===me.sub)return json(res,400,{error:'cannot_follow_self'}); if(req.method==='POST') await query('INSERT INTO follows(follower_id,followee_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[me.sub,id]); else await query('DELETE FROM follows WHERE follower_id=$1 AND followee_id=$2',[me.sub,id]); return json(res,200,{ok:true});}
    if(req.method==='GET'&&path==='/v1/users/search'){
      const q=(url.searchParams.get('q')||'').trim(); const r=await query(`SELECT u.id,u.name,u.avatar_url,COUNT(f.followee_id)::int AS following_count,COUNT(f2.follower_id)::int AS follower_count,EXISTS(SELECT 1 FROM follows fx WHERE fx.follower_id=$1 AND fx.followee_id=u.id) AS followed_by_me FROM users u LEFT JOIN follows f ON f.follower_id=u.id LEFT JOIN follows f2 ON f2.followee_id=u.id WHERE u.id<>$1 AND u.name ILIKE $2 GROUP BY u.id ORDER BY u.name LIMIT 25`,[me.sub,`%${q}%`]); return json(res,200,r.rows);}
    if(req.method==='GET'&&path==='/v1/heatmap'){
      const r=await query(`SELECT ST_AsGeoJSON(ST_SimplifyPreserveTopology(ST_Collect(track),0.00005)) AS geojson FROM activities WHERE user_id=$1 AND track IS NOT NULL`,[me.sub]); return json(res,200,{geojson:r.rows[0]?.geojson?JSON.parse(r.rows[0].geojson):null});
    }
    if(req.method==='POST'&&path==='/v1/sync'){
      const item=await readBody(req); if(item.entity!=='activity'||item.action!=='upsert') return json(res,202,{ok:true,ignored:true});
      const a=item.payload||{}; if(!a.id) return json(res,400,{error:'activity_id_required'});
      const exists=await query('SELECT id FROM activities WHERE id=$1',[a.id]); if(exists.rows.length) return json(res,200,{ok:true,id:a.id,deduped:true});
      const points=Array.isArray(a.points)?a.points:[]; const wkt=pointArrayToWkt(points);
      const baseParams=[a.id,me.sub,a.startedAt,a.endedAt||a.startedAt,a.distanceM||0,a.movingSec||0,a.elevationGainM||0];
      let sql, params;
      if(wkt){
        sql=`INSERT INTO activities(id,user_id,started_at,ended_at,distance_m,moving_sec,elevation_gain_m,track,payload) VALUES($1,$2,to_timestamp($3/1000.0),to_timestamp($4/1000.0),$5,$6,$7,ST_GeomFromText($8,4326),$9::jsonb) ON CONFLICT(id) DO NOTHING`;
        params=[...baseParams,wkt,a];
      } else {
        sql=`INSERT INTO activities(id,user_id,started_at,ended_at,distance_m,moving_sec,elevation_gain_m,track,payload) VALUES($1,$2,to_timestamp($3/1000.0),to_timestamp($4/1000.0),$5,$6,$7,NULL,$8::jsonb) ON CONFLICT(id) DO NOTHING`;
        params=[...baseParams,a];
      }
      await query(sql,params); return json(res,200,{ok:true,id:a.id});
    }
    return json(res,404,{error:'not_found'});
  } catch(e){ console.error(e); return json(res,e.status||500,{error:e.message||'internal_error'}); }
}
const server=http.createServer(route); server.listen(PORT,()=>console.log(`RunnerOS API listening on :${PORT}`));
