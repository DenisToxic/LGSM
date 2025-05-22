# Game Server Management System

[

](LICENSE)
[

](https://hub.docker.com/r/denistoxic/lgsm)
[

](https://github.com/DenisToxic/LGSM/releases)
[

](https://github.com/DenisToxic/LGSM/actions)

A **web-based** platform for provisioning, monitoring, and managing game servers across multiple cloud providers. Features real-time dashboards, alerts, automated backups, and in-browser console access.

---

## 📑 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)

1. [Prerequisites](#prerequisites)
2. [Clone & Configure](#clone--configure)
3. [Docker Deployment](#docker-deployment)



4. [Configuration](#configuration)

1. [.env Variables](#env-variables)
2. [docker-compose.yml](#docker-composeyml)



5. [Usage](#usage)

1. [Web UI](#web-ui)
2. [CLI & API](#cli--api)



6. [WebSockets](#websockets)

1. [Events](#events)



7. [Backup & Restore](#backup--restore)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)
11. [Contributing](#contributing)
12. [License](#license)


---

## 🌟 Features

- **Real-Time Monitoring**WebSockets-powered server status, metrics, and console logs.
- **Server Lifecycle**Create, start, stop, restart, and delete game-server instances.
- **User Management**Role-based auth (JWT, OAuth) & permissions.
- **In-Browser Console**Full terminal access per server.
- **Activity Log & Notifications**Audit trail plus email/Slack alerts on key events.
- **Resource Management**CPU, memory, disk quotas with live usage charts.
- **Automated Backups**On-demand & scheduled, with retention policies.
- **Docker Integration**Container, image, network, and volume management via Docker socket.
- **Cloud-Agnostic**Deploy to AWS, GCP, Azure, DigitalOcean, Linode, and more.
- **Dashboard & Reporting**Customizable alerts, historical charts, PDF/CSV exports.


---

## 🏗 Architecture

![Architecture Diagram](https://your-image-hosting-url.com/architecture-diagram.png)

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Client | Browser (Next.js) | UI, React components, Socket.IO client |
| API | Express + Next.js | Routing, REST API, WebSocket server, auth, business logic |
| Database | PostgreSQL (via Prisma ORM) | Persistent storage of users, servers, configs, logs, metrics |
| Engine | Docker Engine | Spins up/stops game-server containers, network & volume mgmt. |
| Storage | S3 / GCS / Azure Blob (or local FS) | Backup snapshots, retention, restores |

## ⚡ Quick Start

### Prerequisites

- Docker & Docker Compose
- Git


### Clone & Configure

```shellscript
git clone https://github.com/DenisToxic/LGSM.git
cd LGSM
cp .env.example .env
```

Edit `.env` to suit your environment (see Configuration).

### Docker Deployment

```shellscript
docker-compose up -d --build
```

Visit [http://localhost:3000](http://localhost:3000) and log in with the default admin account:

```plaintext
Email: admin@example.com
Password: password123
```

## ⚙️ Configuration

### .env Variables

| Key | Description | Example
|-----|-----|-----
| NODE_ENV | development or production | production
| PORT | HTTP port | 3000
| NEXT_PUBLIC_SOCKET_URL | WebSocket endpoint | [http://localhost:3000](http://localhost:3000)
| NEXT_PUBLIC_API_URL | API base URL | [http://localhost:3000/api](http://localhost:3000/api)
| DATABASE_URL | PostgreSQL DSN | postgresql://postgres:pass@postgres:5432/gameserver
| DOCKER_HOST | Path to Docker socket | /var/run/docker.sock


### docker-compose.yml

```yaml
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
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: gameserver
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## 💻 Usage

### Web UI

- Dashboard – Server health, metrics, alerts.
- Servers – List, search, create & manage instances.
- Backups – Manual snapshots & restores, retention settings.
- Settings – Users, roles, notifications, alert thresholds.


### CLI & API

All operations exposed under `/api/v1`. Example: list servers

```shellscript
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/v1/servers
```

## 🔗 WebSockets

### Overview

- Server: Express + Socket.IO emits events for status, metrics, activities.
- Client: React hooks (useServers, useMetrics, etc.) subscribe & update.


### Events

| Event | Payload
|-----|-----|-----
| server_update |  id, status, metrics 
| system_metrics |  cpu, memory, disk 
| new_activity |  user, action, timestamp 
| console_update |  serverId, output 
| server_created |  id, name, config 
| server_deleted |  id 
| backup_created |  id, serverId, timestamp 
| backup_restored |  id, serverId, timestamp 
| container_update |  containerId, status 
| alert_triggered |  alertId, level, details 


## 💾 Backup & Restore

- Manual: Click "Backup" in the UI.
- Scheduled: Cron-style jobs via UI.
- Storage: Local FS, S3, GCS, Azure Blob.
- Retention: Configure max snapshots per server.
- Restore: One-click from UI or via API.


## 📈 Monitoring & Alerts

- Thresholds: CPU, RAM, disk, latency.
- Notifications: Email, Slack, Webhooks.
- Dashboard: Live and historical charts.
- Reports: Export CSV/PDF uptime & usage data.


## 🛠 Troubleshooting

### Express 5 Path-to-RegExp Error

```diff
- expressApp.all('*', (req, res) => handle(req, res))
+ expressApp.all('/:path(*)', (req, res) => handle(req, res))
```

### Docker Socket Permissions

```shellscript
sudo usermod -aG docker $USER
# or (less secure):
sudo chmod 666 /var/run/docker.sock
```

### Container Networking

```shellscript
docker network create game-server-network
docker run --network game-server-network ...
```

### Database Connectivity

- `docker ps` – ensure Postgres is running
- `docker logs postgres` – inspect startup errors
- `docker exec -it postgres psql -U postgres` – manual connection test


## 🚢 Production Deployment

- Reverse Proxy: Nginx or Traefik for SSL/TLS termination
- Orchestration: Docker Swarm or Kubernetes
- Scaling: Separate DB & backup hosts, load-balanced app nodes
- Logging & Metrics: Centralize with ELK or Prometheus + Grafana


See `examples/traefik-compose.yml` for a Traefik sample.

## 🤝 Contributing

1. Fork & clone this repo
2. Create a feature branch:


```shellscript
git checkout -b feature/my-feature
```

3. Commit your changes:


```shellscript
git commit -am "Add awesome feature"
```

4. Push & open a PR against main
5. Fill out the PR template and wait for review


Please review our Code of Conduct and Contribution Guidelines.

## 📄 License

This project is licensed under the MIT License. See LICENSE for details.