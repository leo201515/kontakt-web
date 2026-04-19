# Kontakt Web - leokontakt.de

Web application for contact details sharing with access codes.

## Credentials

| Item | Value |
|------|-------|
| **Admin Password** | `Leo@2015` |
| **SMTP Email** | `leokontaktde@gmail.com` |
| **SMTP App Password** | `hvbq ytap rmxy itbi` |
| **Reset Email** | `somaratne.leo@gmail.com` |
| **Server IP** | `217.160.66.26` |
| **Domain** | `leokontakt.de` |

## Features

- German language, mobile-friendly design
- Colorful startup screen with "Bestätigen" button
- Tiny "Admin Login" button in bottom right corner
- 5-digit numeric access codes (auto-generated, no duplicates)
- Admin panel: generate/delete codes, manage contact details
- Contact details: Name, Phone 1, Phone 2, Email, Address, Website, Notes
- Password reset via email (sends to admin email)
- All in German

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Startseite | `/` | Code entry + Admin Login |
| Willkommen | `/welcome` | Contact details (after valid code) |
| Admin | `/admin` | Manage codes + contact details |
| Passwort Reset | `/reset-password?token=xxx` | Reset admin password |

## Local Development

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Open http://localhost:5000

## Deploy to IONOS Server

```bash
# 1. Copy files to server
scp -r . root@217.160.66.26:/root/kontakt-web/

# 2. SSH into server
ssh root@217.160.66.26

# 3. Run the deploy script
cd /root/kontakt-web
chmod +x deploy.sh
./deploy.sh
```

## Tech Stack

- Python 3 / Flask
- SQLite database
- Gmail SMTP for password reset emails
- Gunicorn + Nginx for production