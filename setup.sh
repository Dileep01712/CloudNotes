#!/bin/bash

# Navigate to backend folder and initialize npm
cd backend
npm install

# Navigate to frontend folder and initialize npm
cd ../frontend
# Create .env file in frontend folder if it doesn't exist
if [ ! -f ".env" ]; then
    touch .env
    echo "REACT_APP_SERVER_URL=https://cloudnotes-u5s9.onrender.com" > .env
fi
npm install
