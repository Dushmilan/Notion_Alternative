use rusqlite::{params, Connection, Result};
use std::path::PathBuf;

use crate::DocumentMeta;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = Self::db_path()?;
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Self { conn })
    }

    fn db_path() -> Result<PathBuf> {
        let mut path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        path.push("notion-alternative.db");
        Ok(path)
    }

    pub fn init(&self) -> Result<()> {
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'Untitled',
                yjs_state BLOB,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );",
        )?;
        Ok(())
    }

    pub fn save_document(
        &self,
        id: &str,
        title: &str,
        yjs_state: &[u8],
    ) -> Result<()> {
        self.conn.execute(
            "INSERT INTO documents (id, title, yjs_state, updated_at)
             VALUES (?1, ?2, ?3, datetime('now'))
             ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                yjs_state = excluded.yjs_state,
                updated_at = datetime('now')",
            params![id, title, yjs_state],
        )?;
        Ok(())
    }

    pub fn load_document(&self, id: &str) -> Result<Option<Vec<u8>>> {
        let mut stmt = self
            .conn
            .prepare("SELECT yjs_state FROM documents WHERE id = ?1")?;
        let result = stmt.query_row(params![id], |row| row.get::<_, Vec<u8>>(0));
        match result {
            Ok(state) => Ok(Some(state)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn list_documents(&self) -> Result<Vec<DocumentMeta>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, updated_at FROM documents ORDER BY updated_at DESC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(DocumentMeta {
                id: row.get(0)?,
                title: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })?;
        let mut docs = Vec::new();
        for row in rows {
            docs.push(row?);
        }
        Ok(docs)
    }

    pub fn delete_document(&self, id: &str) -> Result<()> {
        self.conn
            .execute("DELETE FROM documents WHERE id = ?1", params![id])?;
        Ok(())
    }
}
