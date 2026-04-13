import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { createSMSHash } from "./hash";


const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection;

export const initDB = async () => {
  db = await sqlite.createConnection(
    "xpensio_local",
    false,
    "no-encryption",
    1,
    false,
  );

  await db.open();

  // ✅ Correct table creation
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pending_sms_transactions (
      id TEXT PRIMARY KEY,
      raw_message TEXT,
      sender TEXT,
      amount REAL,
      type TEXT,
      merchant TEXT,
      confidence REAL,
      status TEXT,
      received_at INTEGER,
      hash TEXT UNIQUE
    );
  `);

  // 🔥 Migration (safe)
  try {
    await db.execute(`ALTER TABLE pending_sms_transactions ADD COLUMN hash TEXT`);
  } catch (e) {
    console.log("hash column already exists",e);
  }
};

export const insertPendingSMS = async (data: {
  raw_message: string;
  sender: string;
  amount?: number;
  type?: string;
  merchant?: string;
  confidence?: number;
  timestamp?: number;
}) => {
  const hash = createSMSHash(
    data.raw_message,
    data.sender,
    data.timestamp
  );

  try {
    await db.run(
      `INSERT OR IGNORE INTO pending_sms_transactions 
      (id, raw_message, sender, amount, type, merchant, confidence, status, received_at, hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        data.raw_message,
        data.sender,
        data.amount ?? null,
        data.type ?? "unknown",
        data.merchant ?? null,
        data.confidence ?? 0,
        "pending",
        data.timestamp ?? Date.now(),
        hash
      ]
    );
  } catch (err) {
    console.error("Insert failed", err);
  }
};

export const getPendingSMS = async () => {
  const res = await db.query(
    `SELECT * FROM pending_sms_transactions 
     WHERE status = 'pending'
     ORDER BY received_at DESC`
  );

  return res.values || [];
};

export const updateSMSStatus = async (
  id: string,
  status: "processed" | "ignored"
) => {
  await db.run(
    `UPDATE pending_sms_transactions SET status = ? WHERE id = ?`,
    [status, id]
  );
};