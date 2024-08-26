# Use Node 18 to support newer dependencies
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build

# Install serve to serve the built app
RUN npm install -g serve

# Command to serve the app on port 5000
CMD ["serve", "-s", "build", "-l", "5000"]
