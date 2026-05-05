# ---- Build Stage ----
FROM node:20-alpine as build

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy application files and build
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Inject custom Nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
