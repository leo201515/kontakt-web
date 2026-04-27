import sqlite3
import random
import string
from datetime import datetime

DATABASE = 'codes.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            level TEXT DEFAULT 'full',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    try:
        conn.execute('ALTER TABLE codes ADD COLUMN level TEXT DEFAULT "full"')
        conn.commit()
    except Exception:
        pass
    conn.close()

def generate_unique_code():
    while True:
        code = ''.join(random.choices(string.digits, k=5))
        if not code_exists(code):
            return code

def code_exists(code):
    conn = get_db_connection()
    result = conn.execute('SELECT id FROM codes WHERE code = ?', (code,)).fetchone()
    conn.close()
    return result is not None

def add_code(level='full'):
    code = generate_unique_code()
    conn = get_db_connection()
    conn.execute('INSERT INTO codes (code, level) VALUES (?, ?)', (code, level))
    conn.commit()
    conn.close()
    return code

def get_all_codes():
    conn = get_db_connection()
    codes = conn.execute('SELECT * FROM codes ORDER BY created_at DESC').fetchall()
    conn.close()
    return codes

def delete_code(code_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM codes WHERE id = ?', (code_id,))
    conn.commit()
    conn.close()

def verify_code(code):
    conn = get_db_connection()
    result = conn.execute('SELECT id, level FROM codes WHERE code = ?', (code,)).fetchone()
    conn.close()
    if result:
        return {'id': result['id'], 'level': result['level']}
    return None

def init_contacts_table():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            phone2 TEXT DEFAULT '',
            email TEXT DEFAULT '',
            address TEXT DEFAULT '',
            website TEXT DEFAULT '',
            fortnite TEXT DEFAULT '',
            roblox TEXT DEFAULT '',
            psn TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    try:
        conn.execute('ALTER TABLE contacts ADD COLUMN fortnite TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute('ALTER TABLE contacts ADD COLUMN roblox TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute('ALTER TABLE contacts ADD COLUMN psn TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    existing = conn.execute('SELECT * FROM contacts').fetchone()
    if not existing:
        conn.execute('''INSERT INTO contacts (name, phone, phone2, email, address, website, fortnite, roblox, psn, notes)
                        VALUES ('', '', '', '', '', '', '', '', '', '')''')
        conn.commit()
    conn.close()

def get_contacts():
    conn = get_db_connection()
    result = conn.execute('SELECT * FROM contacts LIMIT 1').fetchone()
    conn.close()
    return dict(result) if result else {}

def update_contacts(name, phone, phone2, email, address, website, fortnite, roblox, psn, notes):
    conn = get_db_connection()
    conn.execute('''UPDATE contacts SET name=?, phone=?, phone2=?, email=?, address=?, website=?, fortnite=?, roblox=?, psn=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=1''',
                (name, phone, phone2, email, address, website, fortnite, roblox, psn, notes))
    conn.commit()
    conn.close()

def create_reset_token():
    token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
    conn = get_db_connection()
    conn.execute('DELETE FROM reset_tokens')
    conn.execute('INSERT INTO reset_tokens (token) VALUES (?)', (token,))
    conn.commit()
    conn.close()
    return token

def verify_reset_token(token):
    conn = get_db_connection()
    result = conn.execute('SELECT id FROM reset_tokens WHERE token = ? AND created_at > datetime("now", "-1 hour")', (token,)).fetchone()
    conn.close()
    return result is not None

def delete_reset_token(token):
    conn = get_db_connection()
    conn.execute('DELETE FROM reset_tokens WHERE token = ?', (token,))
    conn.commit()
    conn.close()

def add_guest(name, phone='', email='', fortnite='', roblox='', psn='', notes=''):
    conn = get_db_connection()
    conn.execute('INSERT INTO guests (name, phone, email, fortnite, roblox, psn, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                 (name, phone, email, fortnite, roblox, psn, notes))
    conn.commit()
    conn.close()

def get_all_guests():
    conn = get_db_connection()
    guests = conn.execute('SELECT * FROM guests ORDER BY created_at DESC').fetchall()
    conn.close()
    return guests

def delete_guest(guest_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM guests WHERE id = ?', (guest_id,))
    conn.commit()
    conn.close()

def init_guests_table():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT DEFAULT '',
            email TEXT DEFAULT '',
            fortnite TEXT DEFAULT '',
            roblox TEXT DEFAULT '',
            psn TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    try:
        conn.execute('ALTER TABLE guests ADD COLUMN fortnite TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute('ALTER TABLE guests ADD COLUMN roblox TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute('ALTER TABLE guests ADD COLUMN psn TEXT DEFAULT ""')
        conn.commit()
    except Exception:
        pass
    conn.close()

def init_reset_tokens_table():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.close()
