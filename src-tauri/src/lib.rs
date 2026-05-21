mod db;

use db::Database;
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

pub struct DbState(Mutex<Database>);

#[derive(Serialize)]
pub struct DocumentMeta {
    pub id: String,
    pub title: String,
    pub updated_at: String,
}

#[tauri::command]
fn db_init(state: State<DbState>) -> Result<(), String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.init().map_err(|e| e.to_string())
}

#[tauri::command]
fn db_save_document(
    state: State<DbState>,
    id: String,
    title: String,
    yjs_state: Vec<u8>,
) -> Result<(), String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.save_document(&id, &title, &yjs_state)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn db_load_document(
    state: State<DbState>,
    id: String,
) -> Result<Option<Vec<u8>>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.load_document(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_list_documents(state: State<DbState>) -> Result<Vec<DocumentMeta>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.list_documents().map_err(|e| e.to_string())
}

#[tauri::command]
fn db_delete_document(state: State<DbState>, id: String) -> Result<(), String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.delete_document(&id).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let database = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(DbState(Mutex::new(database)))
        .invoke_handler(tauri::generate_handler![
            db_init,
            db_save_document,
            db_load_document,
            db_list_documents,
            db_delete_document,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
