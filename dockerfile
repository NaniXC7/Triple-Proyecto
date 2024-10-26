# Use a Node.js base image to build the application
FROM node:alpine AS build
LABEL authors="kborge"

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package.json ./
COPY package-lock.json ./

# Install the dependencies of only the production environment
#RUN npm install
RUN npm ci --only=production

# Copy the remaining application files to the working directory
COPY . .

# Build the application
RUN npm run build

# Instalar una herramienta de servidor web ligera
RUN npm install -g serve

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]


#FROM node:alpine AS build
#WORKDIR /app
#COPY package.json ./
#COPY package-lock.json ./
#RUN npm install
#COPY . .
#
#FROM node:alpine AS production
#WORKDIR /app
#COPY --from=build /app .
#EXPOSE 3000
#ENTRYPOINT ["node", "index.js"]







# # Use a Node.js base image to build the application
# FROM node:alpine AS build
# LABEL authors="kborge"
#
# # Set the working directory
# WORKDIR /app
#
# # Copy the package.json and package-lock.json to the working directory
# COPY package.json ./
# COPY package-lock.json ./
#
# # Install the dependencies of only the production environment
# #RUN npm install
# RUN npm ci --only=production
#
# # Copy the remaining application files to the working directory
# COPY . .
#
# # Build the application
# RUN npm run build
#
# # # Instalar una herramienta de servidor web ligera
# # RUN npm install -g serve
#
# # Expose port 3000 for the application
# EXPOSE 3000
#
# # Start the application
# CMD ["npm", "start"]












