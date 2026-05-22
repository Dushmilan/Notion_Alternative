use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use std::sync::Mutex;

use crate::DocumentMeta;

pub trait Database: Send + Sync {
    fn init(&self) -> Result<()>;
    fn save_document(&self, id: &str, title: &str, yjs_state: &[u8]) -> Result<()>;
    fn load_document(&self, id: &str) -> Result<Option<Vec<u8>>>;
    fn list_documents(&self) -> Result<Vec<DocumentMeta>>;
    fn delete_document(&self, id: &str) -> Result<()>;
}

pub struct SqliteDatabase {
    conn: Mutex<Connection>,
}

impl SqliteDatabase {
    pub fn new() -> Result<Self> {
        let db_path = Self::db_path()?;
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Self { conn: Mutex::new(conn) })
    }
    fn db_path() -> Result<PathBuf> {
        let mut path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        path.push("notion-alternative.db");
        Ok(path)
    }
}

impl Database for SqliteDatabase {
    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'Untitled',
                yjs_state BLOB,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );"
        )?;
        Ok(())
    }

    fn save_document(&self, id: &str, title: &str, yjs_state: &[u8]) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
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

    fn load_document(&self, id: &str) -> Result<Option<Vec<u8>>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT yjs_state FROM documents WHERE id = ?1")?;
        let result = stmt.query_row(params![id], |row| row.get::<_, Vec<u8>>(0));
        match result {
            Ok(state) => Ok(Some(state)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    fn list_documents(&self) -> Result<Vec<DocumentMeta>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
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

    fn delete_document(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn
            .execute("DELETE FROM documents WHERE id = ?1", params![id])?;
        Ok(())
    }
}

pub struct InMemoryDatabase {
    conn: Mutex<Connection>,
}

impl InMemoryDatabase {
    pub fn new() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys=ON;")?;
        let db = Self { conn: Mutex::new(conn) };
        db.init()?;
        Ok(db)
    }
}

impl Database for InMemoryDatabase {
    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
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

    fn save_document(&self, id: &str, title: &str, yjs_state: &[u8]) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
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

    fn load_document(&self, id: &str) -> Result<Option<Vec<u8>>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT yjs_state FROM documents WHERE id = ?1")?;
        let result = stmt.query_row(params![id], |row| row.get::<_, Vec<u8>>(0));
        match result {
            Ok(state) => Ok(Some(state)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    fn list_documents(&self) -> Result<Vec<DocumentMeta>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
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

    fn delete_document(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn
            .execute("DELETE FROM documents WHERE id = ?1", params![id])?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_db() -> InMemoryDatabase {
        InMemoryDatabase::new().expect("Failed to create test DB")
    }

    #[test]
    fn init_creates_documents_table() {
        let db = create_test_db();
        let docs = db.list_documents().expect("list should work");
        assert!(docs.is_empty());
    }

    #[test]
    fn save_and_load_document() {
        let db = create_test_db();
        let state = vec![1, 2, 3, 4];

        db.save_document("doc-1", "Test Title", &state)
            .expect("save should work");

        let loaded = db
            .load_document("doc-1")
            .expect("load should work")
            .expect("doc should exist");
        assert_eq!(loaded, state);
    }

    #[test]
    fn load_nonexistent_document_returns_none() {
        let db = create_test_db();
        let result = db.load_document("nope").expect("load should work");
        assert!(result.is_none());
    }

    #[test]
    fn save_updates_existing_document() {
        let db = create_test_db();
        db.save_document("doc-1", "Title A", &[1, 2, 3])
            .expect("first save");
        db.save_document("doc-1", "Title B", &[4, 5, 6])
            .expect("second save");

        let loaded = db
            .load_document("doc-1")
            .expect("load should work")
            .expect("doc should exist");
        assert_eq!(loaded, vec![4, 5, 6]);
    }

    #[test]
    fn list_documents_returns_all() {
        let db = create_test_db();
        db.save_document("a", "A", &[]).expect("save a");
        db.save_document("b", "B", &[]).expect("save b");

        let docs = db.list_documents().expect("list should work");
        assert_eq!(docs.len(), 2);
    }

    #[test]
    fn delete_document_removes_it() {
        let db = create_test_db();
        db.save_document("doc-1", "Test", &[1, 2, 3])
            .expect("save");
        db.delete_document("doc-1").expect("delete");

        let result = db.load_document("doc-1").expect("load should work");
        assert!(result.is_none());
    }
}
