#!/usr/bin/env bash

cp .env.prod .env
docker compose build 
