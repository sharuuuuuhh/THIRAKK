/**
 * Runs Thirakku SQL files directly against Supabase Postgres.
 * Supabase connection string format:
 *   postgresql://postgres:[SERVICE_ROLE_KEY]@db.[PROJECT_REF].supabase.co:5432/postgres
 * 
 * The project ref is extracted from the SUPABASE_URL env var.
 */
import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load .env.local
config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.local') })

const { Client } = pg

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars in .env.local')
  process.exit(1)
}

// Supabase pooler — AP South
// DNS resolves to 65.0.195.55 but Node's async DNS fails for this hostname.
// Connect via raw IP with the SNI host set explicitly.
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
const POOLER_HOST = 'aws-0-ap-south-1.pooler.supabase.com'
const POOLER_IP   = '65.0.195.55'   // resolved via nslookup
const POOLER_PORT = 5432             // session mode — supports DDL

console.log(`Project ref: ${projectRef}`)
console.log(`Connecting via Supabase pooler...`)

const __dir = dirname(fileURLToPath(import.meta.url))

async function run() {
  const client = new Client({
    host: POOLER_IP,
    port: POOLER_PORT,
    user: `postgres.${projectRef}`,
    password: SERVICE_KEY,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false,
      servername: POOLER_HOST,   // SNI — tells the server which tenant to route to
    },
  })
  
  try {
    await client.connect()
    console.log('✓ Connected to Supabase Postgres')

    // Run schema
    console.log('\n── Running 01_schema.sql ────────────────────')
    const schemaSQL = readFileSync(join(__dir, '01_schema.sql'), 'utf-8')
    await client.query(schemaSQL)
    console.log('✓ Schema created')

    // Run seed
    console.log('\n── Running 02_seed.sql ──────────────────────')
    const seedSQL = readFileSync(join(__dir, '02_seed.sql'), 'utf-8')
    await client.query(seedSQL)
    console.log('✓ Seed data inserted')

    // Verify
    console.log('\n── Verification ─────────────────────────────')
    const tables = ['stations','trains','route_stops','timetable','reports',
                    'volunteer_logs','trust_scores','forecasts','forecast_checks',
                    'special_days','petitions','signatures']
    
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${t}`)
      console.log(`  ${t}: ${r.rows[0].n} rows`)
    }


  } catch (err) {
    console.error('\n✗ Error:', err.message)
    console.log('\nConnection string used:', connStr.replace(SERVICE_KEY, '***'))
    process.exit(1)
  } finally {
    await client.end().catch(() => {})
  }


  console.log('\n✓ Step 1 database setup complete.')
  console.log('  Visit http://localhost:3000 — all tables should be green.')
}

run()
