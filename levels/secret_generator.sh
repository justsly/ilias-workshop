#!/bin/bash
secret=$(date|md5sum)
echo "<?php" > /var/www/html/dc_secret
echo "$dc_secret = $secret;" >> /var/www/html/dc_secret
echo "?>" >> /var/www/html/dc_secret