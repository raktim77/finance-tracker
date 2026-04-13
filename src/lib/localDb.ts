import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { v4 as uuidv4 } from "uuid";


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
  received_at INTEGER
);
`);
};

export const insertPendingSMS = async (data: {
  raw_message: string;
  sender: string;
  amount?: number;
  type?: string;
  merchant?: string;
  confidence?: number;
}) => {
  const id = uuidv4();

  await db.run(
    `INSERT INTO pending_sms_transactions 
    (id, raw_message, sender, amount, type, merchant, confidence, status, received_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.raw_message,
      data.sender,
      data.amount ?? null,
      data.type ?? "unknown",
      data.merchant ?? null,
      data.confidence ?? 0,
      "pending",
      Date.now()
    ]
  );

  return id;
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