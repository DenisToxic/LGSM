### Game Server Management System

A comprehensive web-based Game Server Management System with real-time monitoring and control.

## Features

- Real-time server monitoring with WebSockets
- Server creation, management, and control
- User authentication and authorization
- Console access to game servers
- Activity tracking and notifications
- Resource allocation and monitoring
- Comprehensive backup and restore system
- Docker container management
- Cloud deployment to multiple providers (AWS, GCP, Azure, DigitalOcean, Linode)
- Advanced monitoring dashboard with alerts
- Detailed reporting system


## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker (optional, for container management features)
- PostgreSQL (optional, for production database)


### Installation

1. Clone the repository:


```shellscript
git clone https://github.com/DenisToxic/test.git
cd test
```

2. Install dependencies:


```shellscript
npm install
# or
yarn install
```

3. Create a `.env.local` file with the following environment variables:


```shellscript
# Server configuration
PORT=3000
NODE_ENV=development

# Socket.IO configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database configuration (optional)
DATABASE_URL="postgresql://postgres:password@localhost:5432/gameserver"

# Docker configuration (optional)
DOCKER_HOST="unix:///var/run/docker.sock"
```

4. Start the development server:


```shellscript
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`


## WebSocket Implementation

This project uses Socket.IO for real-time communication between the server and clients. Here's how it works:

### Server-Side

- A custom Express server integrates Next.js with Socket.IO
- Socket.IO events are emitted for server status changes, metrics updates, and activities
- API routes can emit events using the Socket.IO instance


### Client-Side

- The WebSocketContext provides a React context for WebSocket connections
- Hooks like useServers, useMetrics, and useActivities use WebSockets for real-time updates
- Components subscribe to relevant events and update their state accordingly


### WebSocket Events

| Event | Description
|-----|-----
| `server_update` | Emitted when a server's status or metrics change
| `system_metrics` | Emitted when system-wide metrics are updated
| `new_activity` | Emitted when a new activity is recorded
| `console_update` | Emitted when console output is updated
| `server_created` | Emitted when a new server is created
| `server_deleted` | Emitted when a server is deleted
| `backup_created` | Emitted when a new backup is created
| `backup_restored` | Emitted when a backup is restored
| `container_update` | Emitted when a Docker container status changes
| `alert_triggered` | Emitted when a monitoring alert is triggered


## System Architecture

### Database

The system uses Prisma ORM with support for:

- SQLite (development)
- PostgreSQL (production)


### Real-time Communication

- Socket.IO for WebSocket connections
- Custom Express server for API routes and WebSocket integration


### Docker Integration

- Container management (create, start, stop, restart)
- Image management (pull, list)
- Volume management (create, list)


### Backup System

- Manual and scheduled backups
- Multiple storage options
- Retention policies
- One-click restore


### Monitoring

- Real-time metrics collection
- Historical data visualization
- Alert thresholds configuration
- Email notifications


## Deployment

To deploy this application to production:

1. Build the application:


```shellscript
npm run build
# or
yarn build
```

2. Start the production server:


```shellscript
npm start
# or
yarn start
```

### Production Considerations

- Use a process manager like PM2 to keep the application running
- Set up a reverse proxy with Nginx or Apache
- Configure SSL for secure connections
- Use a production-ready database like PostgreSQL


```shellscript
# Example PM2 startup
pm2 start npm --name "game-server" -- start
pm2 save
pm2 startup
```

## Troubleshooting

### Express 5.0.0 Path-to-RegExp Error

If you encounter this error:

```plaintext
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

This is due to Express 5.0.0 using path-to-regexp 8.0.0, which requires named parameters for wildcards. Fix by updating your server.js:

```javascript
// Change this:
expressApp.all('*', (req, res) => {
  return handle(req, res)
})

// To this:
expressApp.all('/:path(*)', (req, res) => {
  return handle(req, res)
})
```

### PostgreSQL Role Error

If you encounter a PostgreSQL role error, ensure your database user exists and has the correct permissions:

```sql
CREATE ROLE gameserver WITH LOGIN PASSWORD 'password';
ALTER ROLE gameserver CREATEDB;
CREATE DATABASE gameserver OWNER gameserver;
```

### Port Conflicts

If you encounter port conflicts, update your .env.local file to use different ports:

```shellscript
PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.