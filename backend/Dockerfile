# Use an official Node.js runtime as a parent image
FROM node:20.14.0

# Install Ghostscript
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ghostscript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Set the working directory in the container
WORKDIR /app    

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install --ignore-scripts

# Copy the rest of the backend code
COPY ./index.js index.js
COPY ./pdf.js pdf.js

# Set file permissions
RUN chown -R nodejs:nodejs /app

# Expose the port your app runs on
EXPOSE 3001

# Change to a non-root user
USER nodejs

# Command to run your backend server using Node.js
CMD ["npm", "start"]
