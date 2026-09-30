#!/usr/bin/env bash
set -e

echo "🎾 =========================================="
echo "🎾 Starting Padel/Rally Production Deployment"
echo "🎾 =========================================="

# 1. Update and install packages if missing
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker, Git and dependencies..."
    apt-get update -y
    apt-get install -y docker.io docker-compose-v2 git curl
    systemctl enable --now docker
else
    echo "✅ Docker is already installed."
fi

# 2. Ensure docker-compose is available
if ! docker compose version &> /dev/null; then
    echo "📦 Installing docker-compose-v2..."
    apt-get update -y && apt-get install -y docker-compose-v2 || apt-get install -y docker-compose
fi

# 3. Ensure we are in project directory or pull latest
if [ -d ".git" ]; then
    echo "🔄 Pulling latest updates from git..."
    git checkout 001-court-booking-engine || true
    git pull origin 001-court-booking-engine
else
    if [ ! -d "/root/Padel" ]; then
        echo "📥 Cloning repository..."
        git clone -b 001-court-booking-engine https://github.com/amiirnekoo/Padel.git /root/Padel
    fi
    cd /root/Padel
    git pull origin 001-court-booking-engine || true
fi

# 4. Setup .env file
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env configuration from .env.example..."
    cp .env.example .env
fi

# 5. Build and launch containers
echo "🚀 Launching all containers with Docker Compose..."
docker compose up -d --build

echo "=========================================="
echo "🎉 Deployment Complete!"
echo "🌐 Domain: https://raally.ir (via ArvanCloud)"
echo "📡 Check status with: docker compose ps"
echo "=========================================="
