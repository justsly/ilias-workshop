#!/bin/bash
dc_auth="c611795deb9b94c8f9ea7f1bae0884ab";
secret=$(date|md5sum)
echo "<?php" > /var/www/html/dc_secret.php
echo "$dc_secret = $secret;" >> /var/www/html/dc_secret.php
echo "?>" >> /var/www/html/dc_secret.php

curl -H "Content-Type: application/json" -X POST -d '{"dc_auth":$dc_auth,"secret":$secret}' http://81.7.10.250:8080/container/secret