import { type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

async function addColumnIfMissing(
  db: SQLiteDatabase,
  table: string,
  col: string,
  def: string
): Promise<void> {
  try {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  } catch {
    // column already exists — safe to ignore
  }
}

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
  // Phase 3.1 — extended profile fields on auth_local_users
  await addColumnIfMissing(db, 'auth_local_users', 'ciudad',          'TEXT');
  await addColumnIfMissing(db, 'auth_local_users', 'pais',            'TEXT');
  await addColumnIfMissing(db, 'auth_local_users', 'bio',             'TEXT');
  await addColumnIfMissing(db, 'auth_local_users', 'fecha_registro',  'TEXT');
}
