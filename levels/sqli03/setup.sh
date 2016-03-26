#!/bin/bash
mv /var/www/html/secret.php /var/www/html/secret_$(date|md5sum|cut -c 1-16).php