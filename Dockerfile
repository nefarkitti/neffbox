# Use the official Node.js image as base
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from backend folder to the working directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code from backend folder to the working directory
COPY backend .

# Expose the port your app runs on
EXPOSE 10080

# Command to run the application
CMD ["node", "app.js"]
