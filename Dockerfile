# Use Node.js 16 LTS
FROM node:16-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies using clean install to ensure consistent installs
RUN npm ci --only=production

# Copy app source
COPY . .

# Your app binds to port 3000 by default, but Railway will override with PORT env var
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD [ "node", "app.js" ]
