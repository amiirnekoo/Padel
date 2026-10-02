#!/bin/bash
# 🔒 اسکریپت تمدید خودکار گواهی SSL دامنه raally.ir و به‌روزرسانی گیت‌وی
set -e

echo "🔄 بررسی تمدید گواهی SSL..."
certbot renew --webroot -w /var/www/certbot --quiet

echo "📋 کپی گواهی‌های تمدیدشده به دایرکتوری Nginx..."
cp /etc/letsencrypt/live/raally.ir/fullchain.pem /root/Padel/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/raally.ir/privkey.pem /root/Padel/nginx/ssl/key.pem

echo "🚀 راه‌اندازی مجدد Gateway Nginx..."
docker restart rally_gateway

echo "✅ گواهی SSL با موفقیت بررسی و اعمال گردید."
