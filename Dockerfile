FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --force

# Copy application code
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start both applications directly in the CMD
CMD ["sh", "-c", "npm start & node server.js"]