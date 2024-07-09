# Use an official Node.js runtime as a parent image
FROM node:20.14.0

# Install Ghostscript
RUN apt-get update \
    && apt-get install -y ghostscript \
    && apt-get clean

# Set the working directory in the container
WORKDIR /app    

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Command to run your backend server using Node.js
CMD ["npm", "start"]
