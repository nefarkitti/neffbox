# Use the official Node.js image as base
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the rest of the application code from backend folder to the working directory
COPY backend .

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 10080

# Command to run the application
CMD ["node", "."]
