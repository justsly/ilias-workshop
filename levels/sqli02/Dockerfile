# CMDI01 Dockerfile by BB
#
# VERSION 0.0.1
FROM ubuntu:14.04.4
MAINTAINER BB

# Setup apt
RUN apt-get update -y && apt-get upgrade -y

# Install packages
RUN apt-get install -y apache2 php5

# Add Level Files to Container
RUN mkdir /var/www/html/css
RUN mkdir /var/www/html/jquery
ADD css/style.css /var/www/html/css
ADD jquery/jquery-1.12.1.min.js /var/www/html/jquery/jquery-1.12.1.min.js
ADD cmdi01/index.php /var/www/html/index.php
ADD cmdi01/secret.php /var/www/html/secret.php
ADD cmdi01/config.php /var/www/html/config.php
ADD cmdi01/setup.sh /root/setup.sh
RUN chmod u+x /root/setup.sh

# Clean up
RUN rm /var/www/html/index.html
RUN apt-get clean

# Start Apache Server on Container startup
RUN echo "/usr/sbin/apache2ctl start" >> /etc/bash.bashrc
RUN echo "/root/setup.sh" >> /etc/bash.bashrc
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf