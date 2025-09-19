# Esegui questo comando dalla root del tuo progetto 'dietplanner'
docker run -d -p 8080:80 \
  --name dietplannet \
  -v "$(pwd)":/usr/share/nginx/html \
  nginx:latest
