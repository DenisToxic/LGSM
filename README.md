[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/denistoxic/lgsm)](https://hub.docker.com/r/denistoxic/lgsm)
[![GitHub Release](https://img.shields.io/github/v/release/DenisToxic/LGSM)](https://github.com/DenisToxic/LGSM/releases)
[![Build Status](https://github.com/DenisToxic/LGSM/actions/workflows/ci.yml/badge.svg)](https://github.com/DenisToxic/LGSM/actions)

## Game Server Management System

A **web-based** platform for provisioning, monitoring, and managing game servers across multiple cloud providers, with real-time dashboards, alerts, and automated backups.

---

## 🚀 Table of Contents

1. [Features](#features)  
2. [Architecture](#architecture)  
3. [Quick Start](#quick-start)  
   - [Prerequisites](#prerequisites)  
   - [Clone & Configure](#clone--configure)  
   - [Docker Deployment](#docker-deployment)  
4. [Configuration](#configuration)  
   - [.env Variables](#env-variables)  
   - [Docker Compose](#docker-compose)  
5. [Usage](#usage)  
   - [Web UI](#web-ui)  
   - [CLI & API](#cli--api)  
6. [WebSockets](#websockets)  
   - [Events](#events)  
7. [Backup & Restore](#backup--restore)  
8. [Monitoring & Alerts](#monitoring--alerts)  
9. [Troubleshooting](#troubleshooting)  
10. [Production Deployment](#production-deployment)  
11. [Contributing](#contributing)  
12. [License](#license)

---

## 🌟 Features

- **Real-Time Monitoring**  
  WebSockets-powered metrics, server status, and console logs.  
- **Server Lifecycle**  
  Create, start, stop, restart, and delete game server instances.  
- **User Management**  
  Role-based authentication & authorization (JWT, OAuth).  
- **Console Access**  
  In-browser terminal for each game server.  
- **Activity Log & Notifications**  
  Audit trail + email or Slack alerts on key events.  
- **Resource Control**  
  CPU, memory, and disk quotas per server with live usage charts.  
- **Automated Backups**  
  On-demand and scheduled, with retention policies.  
- **Container Orchestration**  
  Docker socket integration for image, container, and network management.  
- **Cloud-Agnostic**  
  Deploy to AWS, GCP, Azure, DigitalOcean, Linode, and more.  
- **Dashboard & Reporting**  
  Customizable alerts, historical charts, and exportable PDF/CSV reports.

---

## 🏗 Architecture

[ Browser ] <--WebSockets--> [ Next.js & Express ] <--REST--> [ PostgreSQL ]
|
+-- Docker Engine
|
+-- Backup Storage (S3, GCS, Azure Blob)

markdown
Copy
Edit

- **Frontend:** Next.js + React, Tailwind, Socket.IO  
- **Backend:** Node.js + Express, Prisma ORM  
- **Database:** PostgreSQL (prod), SQLite (dev)  
- **Container Runtime:** Docker Engine

---

## ⚡ Quick Start

### Prerequisites

- Docker & Docker Compose  
- Git

### Clone & Configure

```bash
git clone https://github.com/DenisToxic/LGSM.git
cd LGSM
cp .env.example .env
Docker Deployment
bash
Copy
Edit
docker-compose up -d --build
Visit http://localhost:3000 and log in with the default admin credentials:

txt
Copy
Edit
Email: admin@example.com
Password: password123
⚙️ Configuration
.env Variables
Key	Description	Example
NODE_ENV	Environment mode (development/production)	production
PORT	HTTP port	3000
NEXT_PUBLIC_SOCKET_URL	WebSocket endpoint	http://localhost:3000
NEXT_PUBLIC_API_URL	API base URL	http://localhost:3000/api
DATABASE_URL	PostgreSQL DSN	postgresql://postgres:pass@postgres:5432/gameserver
DOCKER_HOST	Docker socket path	/var/run/docker.sock

docker-compose.yml
yaml
Copy
Edit
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    env_file:
      - .env
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: gameserver
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
💻 Usage
Web UI
Dashboard: Overview of server health, metrics, and alerts.

Servers: List, search, create, and manage game instances.

Backups: Configure retention, trigger manual restores.

Settings: User roles, notification channels, alert thresholds.

CLI & API
All operations exposed via REST at /api/v1. Example, list servers:

bash
Copy
Edit
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/servers
🔗 WebSockets
How It Works
Server: Express + Socket.IO instance broadcasts events.

Client: React hooks (useServers, useMetrics, etc.) subscribe and update in real time.

Events
Event	Payload Description
server_update	{ id, status, metrics }
system_metrics	{ cpu, memory, disk }
new_activity	{ user, action, timestamp }
console_update	{ serverId, output }
server_created	{ id, name, config }
server_deleted	{ id }
backup_created	{ id, serverId, timestamp }
backup_restored	{ id, serverId, timestamp }
container_update	{ containerId, status }
alert_triggered	{ alertId, level, details }

💾 Backup & Restore
Manual: Click “Backup” on a server panel.

Scheduled: Cron-style schedules via UI.

Storage: Local, S3, GCS, Azure Blob.

Retention: Configure max snapshots per server.

📈 Monitoring & Alerts
Thresholds: CPU, RAM, disk, latency.

Notifications: Email, Slack, Webhook.

Dashboard: Live graphs + historical trends.

Reports: Export CSV/PDF of usage and uptime.

🛠 Troubleshooting
Express 5 Path-to-RegExp Error
diff
Copy
Edit
- expressApp.all('*', (req, res) => handle(req, res))
+ expressApp.all('/:path(*)', (req, res) => handle(req, res))
Docker Socket Permission
bash
Copy
Edit
sudo usermod -aG docker $USER
# or (less secure):
sudo chmod 666 /var/run/docker.sock
Network Issues
bash
Copy
Edit
docker network create game-server-network
docker run --network game-server-network ...
DB Connection
docker ps – ensure postgres is running

docker logs postgres – inspect errors

docker exec -it postgres psql -U postgres – manual check

🚢 Production Deployment
Use Traefik or NGINX for SSL/TLS termination

Deploy via Docker Swarm or Kubernetes

Separate Backup and DB hosts

Centralize logs (ELK, Prometheus + Grafana)

yaml
Copy
Edit
# (see examples/traefik-compose.yml for full config)
🤝 Contributing
Fork & clone

Create a feature branch: git checkout -b feature/my-feature

Commit & push: git commit -am "Add my feature"

Open a pull request against main

Fill out the PR template and await review

Please follow our Code of Conduct and Contribution Guidelines.

📄 License
This project is licensed under the MIT License. See LICENSE for details.