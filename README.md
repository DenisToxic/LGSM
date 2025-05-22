# Game Server Management System

A comprehensive web-based Game Server Management System with real-time monitoring and control.

## Features

- Real-time server monitoring with WebSockets
- Server creation, management, and control
- User authentication and authorization
- Console access to game servers
- Activity tracking and notifications
- Resource allocation and monitoring

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/DenisToxic/test.git
cd test
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Create a `.env.local` file with the following environment variables:

\`\`\`bash
# Server configuration
PORT=3000
NODE_ENV=development

# Socket.IO configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

4. Start the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

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

| Event | Description |
|-------|-------------|
| `server_update` | Emitted when a server's status or metrics change |
| `system_metrics` | Emitted when system-wide metrics are updated |
| `new_activity` | Emitted when a new activity is recorded |
| `console_update` | Emitted when console output is updated |
| `server_created` | Emitted when a new server is created |
| `server_deleted` | Emitted when a server is deleted |

## Deployment

To deploy this application to production:

1. Build the application:

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

2. Start the production server:

\`\`\`bash
npm start
# or
yarn start
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
