#!/bin/bash
echo "create database sqli" | mysql
mysql sqli < /root/sqli01.sql
/root/secret_generator.sh