#!/bin/bash
sudo docker logs neffbox >> log.txt 2>&1
sudo docker build -t neffbox .
sudo docker stop neffbox
sudo docker rm neffbox
sudo docker run -d -p 127.0.0.1:10080:10080 --restart unless-stopped --name neffbox neffbox
