# CMDI01 Dockerfile by BB
#
# VERSION 0.0.1
FROM ubuntu:14.04.4
MAINTAINER BB

# Setup apt
RUN apt-get update -y && apt-get dist-upgrade -y

# Install packages
RUN apt-get install -y apache2 php5

# Add Level Files to Container
RUN mkdir /var/www/html/css
ADD css/style.css /var/www/html/css
ADD index.php /var/www/html/index.php
ADD geheim.txt /var/www/html/geheim.txt

# Clean up
RUN apt-get clean

# Start Apache Server on Container startup
RUN echo "/usr/sbin/apache2ctl start >> /etc/bash.bashrc