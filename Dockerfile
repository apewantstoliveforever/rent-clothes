# Use an official Node.js LTS (Long Term Support) image as base
FROM node:20.10.0 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Node.js image for serving the built app
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built app from the builder stage to the final image
COPY --from=builder /app/build ./build

# Install serve to run the production server
RUN npm install -g serve

# Expose the port on which the app will run
EXPOSE 3000

# Command to run the app using serve
CMD ["serve", "-s", "build"]
