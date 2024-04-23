# Use the official Node.js image as base
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the rest of the application code from backend folder to the working directory
COPY backend .

# Install dependencies
RUN npm install

ENV PORT=10080
ENV PRODUCTION=1
ENV SECRETDEVCODE=YOURSECRETHERE
ENV JWT_KEY=YOURSECRETKEYHEREMAKESUREITSLONG

# Expose the port your app runs on
EXPOSE $PORT

# Copy the SQLite database file to the directory
RUN mkdir -p /usr/src/app/data

# Define a volume for SQLite data
VOLUME ["/usr/src/app/data"]

# Command to run the application
CMD ["node", "."]
