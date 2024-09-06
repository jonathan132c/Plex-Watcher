# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Rebuild SQLite3 for the correct architecture
RUN npm rebuild sqlite3

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the app will run on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]