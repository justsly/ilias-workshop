#!/bin/bash
echo "create database sqli" | mysql
mysql sqli < /root/sqli02.sql
/root/secret_generator.sh