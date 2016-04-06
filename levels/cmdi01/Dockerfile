# CMDI01 Dockerfile by BB
#
# VERSION 0.0.1
FROM ubuntu:14.04.4
MAINTAINER BB
WORKDIR /root
ENTRYPOINT ["./setup.sh"]

# Setup apt
RUN apt-get update -y && apt-get upgrade -y

# Install packages
RUN apt-get install -y apache2 php5 curl

# Add Level Files to Container
RUN mkdir /var/www/html/css
RUN mkdir /var/www/html/jquery
ADD css/style.css /var/www/html/css
ADD jquery/jquery-1.12.1.min.js /var/www/html/jquery/jquery-1.12.1.min.js
ADD cmdi01/index.php /var/www/html/index.php
ADD cmdi01/secret.php /var/www/html/secret.php
ADD config.php /var/www/html/config.php
ADD cmdi01/setup.sh /root/setup.sh
#ADD secret_generator.sh /root/secret_generator.sh
RUN chmod u+x /root/setup.sh
#RUN chmod u+x /root/secret_generator.sh

# Clean up
RUN rm /var/www/html/index.html
RUN apt-get clean

# Fix Apache error message because of missing ServerName
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf