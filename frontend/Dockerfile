# Use an official Node runtime as a parent image
FROM node:20.14.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the React app
RUN npm run build

# Expose port 3001 to the outside world
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
