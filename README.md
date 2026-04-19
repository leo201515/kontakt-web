# Kontakt Web

Web application for contact details sharing with access codes.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
nano .env
```

2. Install and run:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Open http://localhost:5000

## Features

- German language, mobile-friendly design
- Colorful startup screen with "Bestätigen" button
- Tiny "Admin Login" button in bottom right corner
- 5-digit numeric access codes (auto-generated, no duplicates)
- Admin panel: generate/delete codes, manage contact details
- Contact details: Name, Phone 1, Phone 2, Email, Address, Website, Notes
- Password reset via email
- All in German

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Startseite | `/` | Code entry + Admin Login |
| Willkommen | `/welcome` | Contact details (after valid code) |
| Admin | `/admin` | Manage codes + contact details |
| Passwort Reset | `/reset-password?token=xxx` | Reset admin password |

## Deploy to IONOS Server

```bash
scp -r . root@YOUR_SERVER_IP:/root/kontakt-web/
ssh root@YOUR_SERVER_IP
cd /root/kontakt-web
cp .env.example .env
nano .env
chmod +x deploy.sh
./deploy.sh
```

## Tech Stack

- Python 3 / Flask
- SQLite database
- Gmail SMTP for password reset emails
- Gunicorn + Nginx for production