#!/bin/bash 
sudo docker build -t neffbox .
sudo docker stop neffbox
sudo docker rm neffbox
sudo docker run -d -p 10080:10080 --name neffbox neffbox