#!/bin/bash
mv /var/www/html/secret.php /var/www/html/thats_the_secret_$(date|md5sum|cut -c 1-16).php
/usr/sbin/apache2ctl start
secret=$1

echo '<?php' > /var/www/html/dc_secret.php
echo '$dc_secret="'"$secret"'";' >> /var/www/html/dc_secret.php
echo '?>' >> /var/www/html/dc_secret.php

while true; do
    sleep 3600
done