#!/bin/bash
echo "create database sqli" | mysql
mysql sqli < /root/xss01.sql
/root/secret_generator.sh