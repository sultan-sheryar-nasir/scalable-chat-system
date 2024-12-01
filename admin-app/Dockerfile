# Base image
FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Copy app files
COPY ./ /usr/src/app

# Copy shared-lib tarball
COPY ./shared-lib-1.0.0.tgz /usr/src/shared-lib.tgz

# Install dependencies and shared-lib
RUN npm install /usr/src/shared-lib.tgz && npm install

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
