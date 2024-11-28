#!/bin/bash

# Fetch the latest changes from the repository
git fetch

# Pull the latest code from the 'dev' branch
git pull origin dev

# Install dependencies
npm install

# Run the build script
npm run build:admin

# Restart the PM2 application (replace with your app name)
pm2 restart luckytaya-backoffice
