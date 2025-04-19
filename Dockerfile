# Use Node.js 16 LTS (Alpine for smaller image size)
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies using clean install to ensure consistent installs
# Add Python and build tools for any native dependencies
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

# Copy app source
COPY . .

# Your app binds to port 3000 by default, but Railway will override with PORT env var
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
