#!/bin/bash
docker logs neffbox >> log.txt 2>&1
docker build -t neffbox .
docker stop neffbox
docker rm neffbox
docker run -d -p 127.0.0.1:10080:10080 \
    --restart unless-stopped \
    --name neffbox neffbox