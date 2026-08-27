import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const client = new Client({ connectionString: databaseUrl });
await client.connect();
await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
const dir = path.join(__dirname,'migrations');
const files = (await fs.readdir(dir)).filter(f=>f.endsWith('.sql')).sort();
for (const file of files) {
  const version = file.replace(/\.sql$/,'');
  const { rowCount } = await client.query('SELECT 1 FROM schema_migrations WHERE version=$1',[version]);
  if (rowCount) continue;
  const sql = await fs.readFile(path.join(dir,file),'utf8');
  await client.query('BEGIN');
  try { await client.query(sql); await client.query('INSERT INTO schema_migrations(version) VALUES($1)',[version]); await client.query('COMMIT'); console.log(`applied ${version}`); }
  catch (e) { await client.query('ROLLBACK'); throw e; }
}
await client.end();
