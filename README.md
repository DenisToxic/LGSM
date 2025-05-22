**Game Server Management System**

[![Build Status](https://img.shields.io/github/actions/workflow/status/DenisToxic/LGSM/ci.yml?branch=main)](https://github.com/DenisToxic/LGSM/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive web-based Game Server Management System with real-time monitoring, control, and automated resource management.

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)

   * [Prerequisites](#prerequisites)
   * [Installation](#installation)
   * [Configuration](#configuration)
   * [Running the App](#running-the-app)
3. [Architecture Overview](#architecture-overview)

   * [WebSocket Implementation](#websocket-implementation)
   * [Database](#database)
   * [Docker Integration](#docker-integration)
   * [Backup System](#backup-system)
   * [Monitoring & Alerts](#monitoring--alerts)
4. [Deployment](#deployment)

   * [Build & Start](#build--start)
   * [Production Considerations](#production-considerations)
5. [Troubleshooting](#troubleshooting)
6. [Contributing](#contributing)
7. [License](#license)

---

## Features

* **Real-time Server Monitoring** via WebSockets
* **Server Lifecycle Management** (create, start, stop, restart)
* **User Authentication & Authorization** (Role-based access)
* **Interactive Console Access** to game servers
* **Activity Tracking & Notifications**
* **Resource Allocation & Usage Metrics**
* **Automated Backups & One-click Restore**
* **Docker Container Management** (images, volumes, containers)
* **Cloud Deployment Support** (AWS, GCP, Azure, DigitalOcean, Linode)
* **Advanced Monitoring Dashboard** with historical charts and alerts
* **Detailed Reporting** (exportable logs & metrics)

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) v18.x or higher
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/) *(optional, for container management)*
* [PostgreSQL](https://www.postgresql.org/) *(optional, for production database)*

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/DenisToxic/LGSM.git
   cd LGSM
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

### Configuration

Create a `.env.local` in the project root with the following variables:

```dotenv
# Server settings
PORT=3000
NODE_ENV=development

# WebSocket & API URLs
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/gameserver"

# Docker (if using container features)
DOCKER_HOST="unix:///var/run/docker.sock"
```

### Running the App

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Architecture Overview

### WebSocket Implementation

* Uses **Socket.IO** for bidirectional real-time communication.
* **Server-Side**: Custom Express server integrates Next.js and Socket.IO. Emits events for updates and metrics.
* **Client-Side**: `WebSocketContext` provides hooks (`useServers`, `useMetrics`, `useActivities`) for subscribing to events.

**Key Events**:

| Event              | Description                      |
| ------------------ | -------------------------------- |
| `server_update`    | Server status or metrics changed |
| `system_metrics`   | Global system metrics updated    |
| `new_activity`     | New activity logged              |
| `console_update`   | Console output received          |
| `server_created`   | New server instance created      |
| `server_deleted`   | Server instance deleted          |
| `backup_created`   | Backup completed                 |
| `backup_restored`  | Backup restoration completed     |
| `container_update` | Docker container status changed  |
| `alert_triggered`  | Monitoring alert fired           |

### Database

* **Prisma ORM** supporting:

  * SQLite (development)
  * PostgreSQL (production)

### Docker Integration

* Manage containers (create, start, stop, restart)
* Pull and list images
* Volume creation and listing

### Backup System

* Manual & scheduled backups
* Multiple storage backends
* Retention policies
* One-click restore

### Monitoring & Alerts

* Real-time metrics collection (CPU, RAM, disk)
* Historical data charts
* Customizable alert thresholds
* Email notifications on alerts

---

## Deployment

### Build & Start

```bash
npm run build
# or
yarn build
npm start
# or
yarn start
```

### Production Considerations

* Use a process manager (e.g., [PM2](https://pm2.keymetrics.io/)):

  ```bash
  pm2 start npm --name "game-server" -- start
  pm2 save
  pm2 startup
  ```
* Set up a reverse proxy (Nginx, Apache) with SSL
* Use a robust database (PostgreSQL)

---

## Troubleshooting

* **Express Path-to-RegExp Error**:

  ```js
  // Update in server.js
  // from:
  expressApp.all('*', (req, res) => handle(req, res))
  // to:
  expressApp.all('/:path(*)', (req, res) => handle(req, res))
  ```

* **PostgreSQL Role Error**:

  ```sql
  CREATE ROLE gameserver WITH LOGIN PASSWORD 'password';
  ALTER ROLE gameserver CREATEDB;
  CREATE DATABASE gameserver OWNER gameserver;
  ```

* **Port Conflict**: Change ports in `.env.local`:

  ```dotenv
  PORT=3001
  NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
