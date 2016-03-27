# CMDI01 Dockerfile by BB
#
# VERSION 0.0.1
FROM ubuntu:14.04.4
MAINTAINER BB

# Setup apt
RUN apt-get update -y && apt-get upgrade -y

# Install packages
RUN apt-get install -y apache2 php5 curl mysql-server php5-mysql

# Add Level Files to Container
RUN mkdir /var/www/html/css
RUN mkdir /var/www/html/jquery
ADD css/style.css /var/www/html/css
ADD jquery/jquery-1.12.1.min.js /var/www/html/jquery/jquery-1.12.1.min.js
ADD sqli/01/index.php /var/www/html/index.php
ADD sqli/dbconnect.php /var/www/html/dbconnect.php
ADD sqli/01/sql_statement.txt /var/www/html/sql_statement.txt
ADD sqli/admin_infos.php /var/www/html/admin_infos.php
ADD config.php /var/www/html/config.php
ADD sqli/01/setup.sh /root/setup.sh
ADD secret_generator.sh /root/secret_generator.sh
ADD sqli/01/sqli01.sql /root/sqli01.sql
RUN chmod u+x /root/setup.sh
RUN chmod u+x /root/secret_generator.sh

# Clean up
RUN rm /var/www/html/index.html
RUN apt-get clean

#Fix Apache Error msg
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Start Apache Server on Container startup
RUN echo "/usr/sbin/apache2ctl start" >> /etc/bash.bashrc
RUN echo "/etc/init.d/mysql start" >> /etc/bash.bashrc
RUN echo "/root/setup.sh" >> /etc/bash.bashrc