FROM node:20-alpine3.19 AS builder                                                                                                                                            
                                                                                                                                                                                
WORKDIR /app

# Install system dependencies first (rarely changes)
RUN apk add --no-cache bash

# Copy dependency files first for better layer caching
COPY package.json package-lock.json .npmrc ./

# Install dependencies (cached unless package files change)
RUN npm install --force

# Copy the rest of the source code
COPY . .

# Run deploy time script and build
RUN bash set-deploy-time.sh
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]


