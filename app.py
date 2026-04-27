import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from database import init_db, add_code, get_all_codes, delete_code, verify_code, init_contacts_table, get_contacts, update_contacts, create_reset_token, verify_reset_token, delete_reset_token, init_reset_tokens_table, add_guest, get_all_guests, delete_guest, init_guests_table
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'kontakt-web-secret-key-2024')

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Leo@2015')

SMTP_EMAIL = os.environ.get('SMTP_EMAIL', 'leokontaktde@gmail.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'hvbqytaprmxyitbi')
RESET_EMAIL = os.environ.get('RESET_EMAIL', 'somaratne.leo@gmail.com')

@app.route('/')
def index():
    init_db()
    init_contacts_table()
    init_reset_tokens_table()
    init_guests_table()
    return render_template('index.html')

@app.route('/welcome')
def welcome():
    init_guests_table()
    return render_template('welcome.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/api/verify', methods=['POST'])
def api_verify():
    data = request.get_json()
    code = data.get('code', '').strip()

    if len(code) != 5 or not code.isdigit():
        return jsonify({'success': False, 'message': 'Bitte geben Sie einen gültigen 5-stelligen Code ein.'})

    result = verify_code(code)
    if result:
        return jsonify({'success': True, 'message': 'Willkommen!', 'level': result['level']})
    else:
        return jsonify({'success': False, 'message': 'Ungültiger Code. Bitte versuchen Sie es erneut.'})

@app.route('/api/admin/login', methods=['POST'])
def api_admin_login():
    global ADMIN_PASSWORD
    data = request.get_json()
    password = data.get('password', '')

    if password == ADMIN_PASSWORD:
        return jsonify({'success': True, 'message': 'Anmeldung erfolgreich!'})
    else:
        return jsonify({'success': False, 'message': 'Falsches Passwort.'})

@app.route('/api/admin/codes', methods=['GET'])
def api_admin_get_codes():
    codes = get_all_codes()
    return jsonify({
        'success': True,
        'codes': [dict(row) for row in codes]
    })

@app.route('/api/admin/codes', methods=['POST'])
def api_admin_create_code():
    data = request.get_json()
    level = data.get('level', 'full') if data else 'full'
    if level not in ('full', 'standard', 'basic'):
        level = 'full'
    new_code = add_code(level)
    return jsonify({
        'success': True,
        'message': 'Neuer Code wurde erstellt!',
        'code': new_code,
        'level': level
    })

@app.route('/admin/codes/<int:code_id>', methods=['DELETE'])
def api_admin_delete_code(code_id):
    delete_code(code_id)
    return jsonify({
        'success': True,
        'message': 'Code wurde gelöscht!'
    })

@app.route('/api/contacts', methods=['GET'])
def api_get_contacts():
    contacts = get_contacts()
    return jsonify({'success': True, 'contacts': contacts})

@app.route('/api/admin/contacts', methods=['POST'])
def api_admin_update_contacts():
    data = request.get_json()
    name = data.get('name', '')
    phone = data.get('phone', '')
    phone2 = data.get('phone2', '')
    email = data.get('email', '')
    address = data.get('address', '')
    website = data.get('website', '')
    fortnite = data.get('fortnite', '')
    roblox = data.get('roblox', '')
    psn = data.get('psn', '')
    notes = data.get('notes', '')
    update_contacts(name, phone, phone2, email, address, website, fortnite, roblox, psn, notes)
    return jsonify({'success': True, 'message': 'Kontaktdaten gespeichert!'})

@app.route('/api/guests', methods=['POST'])
def api_add_guest():
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'Name ist erforderlich.'})
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    fortnite = data.get('fortnite', '').strip()
    roblox = data.get('roblox', '').strip()
    psn = data.get('psn', '').strip()
    notes = data.get('notes', '').strip()
    add_guest(name, phone, email, fortnite, roblox, psn, notes)
    return jsonify({'success': True, 'message': 'Vielen Dank! Ihre Daten wurden gespeichert.'})

@app.route('/api/admin/guests', methods=['GET'])
def api_admin_get_guests():
    guests = get_all_guests()
    return jsonify({
        'success': True,
        'guests': [dict(row) for row in guests]
    })

@app.route('/admin/guests/<int:guest_id>', methods=['DELETE'])
def api_admin_delete_guest(guest_id):
    delete_guest(guest_id)
    return jsonify({
        'success': True,
        'message': 'Gast wurde gelöscht!'
    })

@app.route('/reset-password')
def reset_password_page():
    return render_template('reset_password.html')

@app.route('/api/admin/forgot-password', methods=['POST'])
def api_forgot_password():
    token = create_reset_token()
    reset_link = f'http://leokontakt.de/reset-password?token={token}'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Passwort Zurücksetzen - Kontakt Web'
    msg['From'] = SMTP_EMAIL
    msg['To'] = RESET_EMAIL

    html = f'''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#667eea,#764ba2,#f093fb);padding:40px 0;">
<tr><td align="center">
<table width="500" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.15);">
<tr><td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
<h1 style="color:white;margin:0;font-size:28px;">Passwort Zurücksetzen</h1>
<p style="color:rgba(255,255,255,0.9);font-size:16px;margin:10px 0 0;">Kontakt Web Admin-Panel</p>
</td></tr>
<tr><td style="padding:40px 30px;text-align:center;">
<p style="font-size:18px;color:#333;margin:0 0 10px;">Jemand hat eine Passwort-Zurücksetzung angefordert.</p>
<p style="font-size:16px;color:#666;margin:0 0 30px;">Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen:</p>
<a href="{reset_link}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-decoration:none;border-radius:50px;font-size:18px;font-weight:bold;box-shadow:0 5px 20px rgba(102,126,234,0.4);">Passwort Zurücksetzen</a>
<p style="font-size:14px;color:#999;margin:25px 0 0;">Dieser Link ist 1 Stunde gültig.</p>
<p style="font-size:14px;color:#999;margin:5px 0 0;">Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
</td></tr>
<tr><td style="background:#f8f9fa;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
<p style="font-size:12px;color:#aaa;margin:0;">Kontakt Web &copy; 2026 - Alle Rechte vorbehalten</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>'''

    text_part = f'Passwort Zuruecksetzen Link: {reset_link}'

    msg.attach(MIMEText(text_part, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, RESET_EMAIL, msg.as_string())
        return jsonify({'success': True, 'message': 'Eine E-Mail zum Zurücksetzen wurde an den Admin gesendet.'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Fehler beim Senden: {str(e)}'})

@app.route('/api/admin/reset-password', methods=['POST'])
def api_reset_password():
    global ADMIN_PASSWORD
    data = request.get_json()
    token = data.get('token', '')
    new_password = data.get('password', '')

    if not verify_reset_token(token):
        return jsonify({'success': False, 'message': 'Ungültiger oder abgelaufener Link.'})

    if len(new_password) < 4:
        return jsonify({'success': False, 'message': 'Passwort muss mindestens 4 Zeichen lang sein.'})

    ADMIN_PASSWORD = new_password
    delete_reset_token(token)

    return jsonify({'success': True, 'message': 'Passwort wurde erfolgreich geändert!'})

@app.route('/api/verify-reset-token', methods=['POST'])
def api_verify_reset_token():
    data = request.get_json()
    token = data.get('token', '')
    valid = verify_reset_token(token)
    return jsonify({'success': valid})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)