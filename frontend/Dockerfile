FROM nginx:alpine

# Copy pre-built production bundle
COPY frontend/dist /usr/share/nginx/html

# Copy Nginx SPA configuration
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
