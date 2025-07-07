# Use Node.js official image
FROM node:18-alpine

# Set working directory to /app (not /)
WORKDIR /app

# Install global dependencies
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose ports
EXPOSE 3000 19000 19001 19002

# Start the development server
CMD ["npx", "expo", "start", "--web", "--clear"]