#!/bin/bash
secret_hash=$(date|md5sum|cut -c 1-16)
mv /var/www/html/secret.php /var/www/html/secret_$secret_hash.php
/root/secret_generator.sh
adduser myuser --gecos "<? include('/var/www/html/secret_$secret_hash.php'); ?>,,," --disabled-password