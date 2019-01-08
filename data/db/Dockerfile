FROM bitnami/mongodb:4.1-debian-9

COPY init.sh /docker-entrypoint-initdb.d
COPY filldb.js /scripts/

EXPOSE 27017
