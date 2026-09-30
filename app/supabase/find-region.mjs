/**
 * Finds the correct Supabase pooler region for a project by trying all regions.
 */
import pg from 'pg'
import dns from 'dns/promises'

const { Client } = pg

const PROJECT_REF = 'jswisufprwjguaronaip'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd2lzdWZwcndqZ3Vhcm9uYWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc0ODM3MiwiZXhwIjoyMTA2MzI0MzcyfQ.c4quqVC13Eap0g94lWKUcqieXCytOZYABGX5NpRWjxg'

const REGIONS = [
  'aws-0-ap-south-1',
  'aws-0-us-east-1',
  'aws-0-eu-west-1',
  'aws-0-us-west-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-northeast-1',
]

async function tryConnect(host, ip) {
  const client = new Client({
    host: ip,
    port: 5432,
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    database: 'postgres',
    ssl: { rejectUnauthorized: false, servername: host },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    const res = await client.query('SELECT current_database()')
    await client.end()
    return { ok: true, db: res.rows[0].current_database }
  } catch (err) {
    await client.end().catch(() => {})
    return { ok: false, err: err.message }
  }
}

console.log(`Testing all Supabase pooler regions for project: ${PROJECT_REF}\n`)

for (const region of REGIONS) {
  const host = `${region}.pooler.supabase.com`
  process.stdout.write(`  ${region} ... `)
  try {
    const addrs = await dns.resolve4(host)
    const ip = addrs[0]
    const result = await tryConnect(host, ip)
    if (result.ok) {
      console.log(`✓ CONNECTED! db=${result.db}`)
      console.log(`\nCorrect region: ${region}`)
      console.log(`Host: ${host}`)
      process.exit(0)
    } else {
      console.log(`✗ ${result.err.substring(0, 60)}`)
    }
  } catch (err) {
    console.log(`✗ DNS: ${err.message}`)
  }
}

console.log('\nNo region connected. The project may need direct DB access.')
