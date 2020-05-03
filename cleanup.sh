#!/bin/bash

echo "Cleaning cache.."
npm cache clean --force
echo "Removing node modules.."
rm -rf node_modules package-lock.json
echo "Installing new modules.."
npm install
