import sqlite3
import os

DB_PATH = r'C:\Users\Saulsville-internet\.gemini\antigravity\scratch\magae-funerals\magaye_funerals.db'

def dump_db():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    for table_name in tables:
        table_name = table_name[0]
        print(f"\n--- TABLE: {table_name} ---")
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Columns: {', '.join(columns)}")
        
        # Get data (limit to 10 for visibility)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 10")
        rows = cursor.fetchall()
        for row in rows:
            # Mask idUpload for readability
            row_list = list(row)
            if 'idUpload' in columns:
                idx = columns.index('idUpload')
                if row_list[idx]:
                    row_list[idx] = "[FILE DATA]"
            print(row_list)

    conn.close()

if __name__ == "__main__":
    dump_db()
