import fs from 'fs';
import path from 'path';
import pool from './pool';

/**
 * Migration runner: reads schema.sql and executes it against the database.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */
async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  const client = await pool.connect();
  try {
    console.log('🔄 Running database migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
