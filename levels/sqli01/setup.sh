#!/bin/bash
/usr/sbin/apache2ctl start
/etc/init.d/mysql start
echo "create database sqli" | mysql
mysql sqli < /root/sqli01.sql

secret=$1

echo '<?php' > /var/www/html/dc_secret.php
echo '$dc_secret="'"$secret"'";' >> /var/www/html/dc_secret.php
echo '?>' >> /var/www/html/dc_secret.php

tail -f /var/log/apache2/access.log