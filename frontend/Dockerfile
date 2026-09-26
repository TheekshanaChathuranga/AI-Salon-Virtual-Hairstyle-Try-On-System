FROM nginx:alpine

# Copy pre-built production assets directly (built in 2s with npm run build)
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
