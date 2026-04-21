import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { createSMSHash } from "./hash";


const sqlite = new SQLiteConnection(CapacitorSQLite);
const DB_NAME = "xpensio_local";

let db: SQLiteDBConnection | null = null;
let dbInitPromise: Promise<SQLiteDBConnection> | null = null;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function retrieveConnection() {
  try {
    return await sqlite.retrieveConnection(DB_NAME, false);
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes("does not exist")) {
      return null;
    }

    throw error;
  }
}

async function closeStaleConnection() {
  try {
    await sqlite.closeConnection(DB_NAME, false);
  } catch {
    // The native side may already have cleared the connection.
  }
}

async function createConnection() {
  try {
    return await sqlite.createConnection(
      DB_NAME,
      false,
      "no-encryption",
      1,
      false,
    );
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes("already exists")) {
      const existingConnection = await retrieveConnection();
      if (existingConnection) return existingConnection;

      await closeStaleConnection();
      return sqlite.createConnection(
        DB_NAME,
        false,
        "no-encryption",
        1,
        false,
      );
    }

    throw error;
  }
}

async function createOrRetrieveConnection() {
  const connection = await retrieveConnection() ?? await createConnection();

  const isOpen = await connection
    .isDBOpen()
    .then((res) => !!res.result)
    .catch(() => false);

  if (!isOpen) {
    await connection.open();
  }

  return connection;
}

export const initDB = async () => {
  if (db) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const connection = await createOrRetrieveConnection();

    // ✅ Correct table creation
    await connection.execute(`
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

    // // 🔥 Migration (safe)
    // try {
    //   await connection.execute(`ALTER TABLE pending_sms_transactions ADD COLUMN hash TEXT`);
    // } catch (e) {
    //   console.log("hash column already exists", e);
    // }

    db = connection;
    return connection;
  })();

  try {
    return await dbInitPromise;
  } catch (error) {
    dbInitPromise = null;
    throw error;
  }
};

const getDB = async () => {
  return db ?? initDB();
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
  const database = await getDB();
  const hash = createSMSHash(
    data.raw_message,
    data.sender,
    data.timestamp
  );

  try {
    await database.run(
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
  const database = await getDB();
  const res = await database.query(
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
  const database = await getDB();
  await database.run(
    `UPDATE pending_sms_transactions SET status = ? WHERE id = ?`,
    [status, id]
  );
};
