# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the files
COPY . .

# Remove the existing node_modules directory
RUN rm -rf node_modules

# Reinstall dependencies
RUN npm install --omit=dev

# Set environment variables
ENV NODE_ENV=production

# Expose the port
EXPOSE 4000

# Seed the database
RUN node seedDatabase.js

# Start the app
CMD ["node", "index.js"]