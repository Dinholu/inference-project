FROM node:24.1-slim

# Update package lists and install security updates
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*
LABEL maintainer="Your Name Alizee"
WORKDIR /app
COPY package*.json ./
RUN npm install && npm audit fix --force

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
