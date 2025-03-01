# Node.js image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./   

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the files
COPY . .

# Build the app
RUN npm run build

# HTTP server to serve the static files
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build"]