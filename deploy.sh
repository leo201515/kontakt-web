#!/bin/bash
set -e

echo "=== Kontakt Web Deployment ==="

echo "[1/6] Installing system dependencies..."
apt update && apt install -y python3-venv python3-pip nginx

echo "[2/6] Setting up Python virtual environment..."
cd /root/kontakt-web
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "[3/6] Initializing database..."
python3 -c "from database import init_db, init_contacts_table, init_reset_tokens_table; init_db(); init_contacts_table(); init_reset_tokens_table(); print('DB OK')"

echo "[4/6] Configuring Nginx..."
cat > /etc/nginx/sites-available/kontakt-web << 'NGINXEOF'
server {
    listen 80;
    server_name leokontakt.de www.leokontakt.de;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /root/kontakt-web/static/;
        expires 7d;
    }
}
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/kontakt-web /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "[5/6] Creating systemd service..."
cat > /etc/systemd/system/kontakt-web.service << 'SVCEOF'
[Unit]
Description=Kontakt Web App
After=network.target

[Service]
User=root
WorkingDirectory=/root/kontakt-web
ExecStart=/root/kontakt-web/venv/bin/gunicorn -b 127.0.0.1:5000 --workers 2 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable kontakt-web
systemctl restart kontakt-web

echo "[6/6] Opening firewall..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

echo ""
echo "=== Deployment Complete! ==="
echo "Website: http://leokontakt.de"
echo "Admin:   Click tiny button bottom right"
echo "Password: Leo@2015"
echo ""
echo "Useful commands:"
echo "  systemctl status kontakt-web   - Check app status"
echo "  systemctl restart kontakt-web  - Restart app"
echo "  journalctl -u kontakt-web -f  - View logs"