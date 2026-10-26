FROM nginx:1.31.8-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./index.html /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]