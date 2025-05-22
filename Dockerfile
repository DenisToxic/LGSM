FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --force

# Copy application code
COPY . .

# Build the application
ENV NODE_OPTIONS='--max_old_space_size=8000'
RUN npm run build

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Create a more robust start script
RUN echo '#!/bin/sh\n\
cd /app\n\
echo "Current directory: $(pwd)"\n\
echo "Directory contents:"\n\
ls -la\n\
echo "Next.js build directory:"\n\
ls -la .next || echo "No .next directory found"\n\
echo "Starting Next.js app..."\n\
NODE_ENV=production node_modules/.bin/next start &\n\
NEXT_PID=$!\n\
echo "Next.js started with PID: $NEXT_PID"\n\
echo "Starting WebSocket server..."\n\
node server.js &\n\
WS_PID=$!\n\
echo "WebSocket server started with PID: $WS_PID"\n\
wait' > /app/start.sh

RUN chmod +x /app/start.sh

# Start both applications
CMD ["/bin/sh", "/app/start.sh"]