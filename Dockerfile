# Use the official Node.js image as the base image
FROM node:18

# Install Chrome
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && apt-get install -y google-chrome-stable && \
    tor && \
    procps && \
    net-tools && \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Salin file konfigurasi Tor
COPY torrc /etc/tor/torrc

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application runs on (if applicable)
EXPOSE 3000 9050

# Jalankan Tor & Node.js
CMD tor & node index.js
