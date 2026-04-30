from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'magaye_funerals.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Members table
    cursor.execute('''CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        phone TEXT,
        plan TEXT,
        type TEXT,
        status TEXT,
        joinDate TEXT,
        premium REAL,
        password TEXT,
        idUpload TEXT
    )''')
    
    # Dependants table
    cursor.execute('''CREATE TABLE IF NOT EXISTS dependants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memberId TEXT,
        name TEXT,
        relationship TEXT,
        idNumber TEXT,
        idUpload TEXT,
        FOREIGN KEY(memberId) REFERENCES members(id)
    )''')
    
    # Migrations
    try: cursor.execute('ALTER TABLE members ADD COLUMN idUpload TEXT')
    except: pass
    try: cursor.execute('ALTER TABLE dependants ADD COLUMN idUpload TEXT')
    except: pass
    try: cursor.execute('ALTER TABLE claims ADD COLUMN idUpload TEXT')
    except: pass
    try: cursor.execute('ALTER TABLE members ADD COLUMN password TEXT')
    except: pass

    # Payments table
    # ... (rest of init_db)
    
    # Payments table
    cursor.execute('''CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        memberId TEXT,
        amount REAL,
        date TEXT,
        method TEXT,
        FOREIGN KEY(memberId) REFERENCES members(id)
    )''')
    
    # Claims table
    cursor.execute('''CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memberId TEXT,
        deceasedName TEXT,
        reportDate TEXT,
        status TEXT,
        idUpload TEXT,
        FOREIGN KEY(memberId) REFERENCES members(id)
    )''')
    
    # Migration: Ensure messages table exists
    try:
        cursor.execute('''CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            memberId TEXT,
            title TEXT,
            content TEXT,
            date TEXT,
            isRead INTEGER DEFAULT 0,
            FOREIGN KEY(memberId) REFERENCES members(id)
        )''')
    except: pass
    
    conn.commit()
    conn.close()

# --- Static File Serving ---
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'guest.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(BASE_DIR, path)

# --- API Routes ---
@app.route('/api/members', methods=['GET'])
def get_members():
    conn = get_db()
    members = conn.execute('SELECT * FROM members').fetchall()
    conn.close()
    return jsonify([dict(m) for m in members])

@app.route('/api/members/<id>', methods=['GET'])
def get_member(id):
    conn = get_db()
    member = conn.execute('SELECT * FROM members WHERE id = ?', (id,)).fetchone()
    if not member:
        conn.close()
        return jsonify({'error': 'Member not found'}), 404
    
    m_dict = dict(member)
    deps = conn.execute('SELECT * FROM dependants WHERE memberId = ?', (id,)).fetchall()
    m_dict['dependants'] = [dict(d) for d in deps]
    conn.close()
    return jsonify(m_dict)

@app.route('/api/members', methods=['POST'])
def add_member():
    data = request.json
    conn = get_db()
    try:
        conn.execute('''INSERT INTO members (id, firstName, lastName, phone, plan, type, status, joinDate, premium, password, idUpload)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    (data['id'], data['firstName'], data['lastName'], data['phone'], 
                     data['plan'], data['type'], data['status'], data['joinDate'], data['premium'], data['password'], data.get('idUpload')))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Member already exists'}), 400
    finally:
        conn.close()
    return jsonify({'message': 'Member created', 'id': data['id']})

@app.route('/api/members/<id>/status', methods=['PUT'])
def update_member_status(id):
    data = request.json
    status = data.get('status')
    conn = get_db()
    conn.execute('UPDATE members SET status = ? WHERE id = ?', (status, id))
    
    if status == 'Active':
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn.execute('''INSERT INTO messages (memberId, title, content, date) 
                       VALUES (?, ?, ?, ?)''', 
                    (id, '🎉 Policy Activated: Congratulations!', 
                     f'Your Magaye Funerals policy is now active. Your certificate of coverage is ready for download. Activation Date: {now}', 
                     now))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status updated'})

@app.route('/api/members/<id>', methods=['DELETE'])
def delete_member(id):
    conn = get_db()
    conn.execute('DELETE FROM members WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Member deleted'})

@app.route('/api/payments', methods=['GET'])
def get_payments():
    conn = get_db()
    payments = conn.execute('SELECT * FROM payments').fetchall()
    conn.close()
    return jsonify([dict(p) for p in payments])

@app.route('/api/payments', methods=['POST'])
def add_payment():
    data = request.json
    conn = get_db()
    conn.execute('INSERT INTO payments (id, memberId, amount, date, method) VALUES (?, ?, ?, ?, ?)',
                (data['id'], data['memberId'], data['amount'], data['date'], data['method']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Payment recorded'})

@app.route('/api/claims', methods=['GET'])
def get_claims():
    conn = get_db()
    claims = conn.execute('SELECT * FROM claims').fetchall()
    conn.close()
    return jsonify([dict(c) for c in claims])

@app.route('/api/claims', methods=['POST'])
def submit_claim():
    data = request.json
    conn = get_db()
    conn.execute('INSERT INTO claims (memberId, deceasedName, reportDate, status, idUpload) VALUES (?, ?, ?, ?, ?)',
                (data['memberId'], data['deceasedName'], data['reportDate'], 'Pending', data.get('idUpload')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Claim submitted'})

@app.route('/api/claims/<int:id>/status', methods=['PUT'])
def update_claim_status(id):
    data = request.json
    conn = get_db()
    conn.execute('UPDATE claims SET status = ? WHERE id = ?', (data['status'], id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Claim status updated'})

@app.route('/api/staff/login', methods=['POST'])
def staff_login():
    data = request.json
    if data.get('email') == 'admin@magayefuneral' and data.get('password') == 'adminpass':
        return jsonify({'success': True, 'token': 'mock-staff-token-123'})
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/members/<id>/dependants', methods=['POST'])
def add_dependant(id):
    data = request.json
    conn = get_db()
    conn.execute('INSERT INTO dependants (memberId, name, relationship, idNumber, idUpload) VALUES (?, ?, ?, ?, ?)',
                (id, data['name'], data['relationship'], data['idNumber'], data.get('idUpload')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Dependant added'})

@app.route('/api/messages/<id>', methods=['GET'])
def get_messages(id):
    conn = get_db()
    messages = conn.execute('SELECT * FROM messages WHERE memberId = ? ORDER BY date DESC', (id,)).fetchall()
    conn.close()
    return jsonify([dict(m) for m in messages])

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)

