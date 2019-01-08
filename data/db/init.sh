#!/bin/bash
echo 'Coucou ******************************'
set -e
mongo --nodb --eval "var dbName='$MONGODB_DATABASE'; var user='$MONGODB_USERNAME'; var password='$MONGODB_PASSWORD';" /scripts/filldb.js
