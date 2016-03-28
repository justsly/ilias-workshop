#!/bin/bash
echo "create database sqli" | mysql
mysql sqli < /root/sqli03.sql
/root/secret_generator.sh