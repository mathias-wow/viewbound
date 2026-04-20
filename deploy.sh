# This script is used to deploy the latest version of Viewbound to the server. It pulls the latest version of the Docker images and starts the containers. It is a simple script that can be run on the server, possibly as a cron job, to keep the server up to date with the latest version of the application.

echo "Deploying latest version of Viewbound"
docker compose pull
echo "Stating containers"
docker compose up -d
echo "All set!"
docker logs viewbound-backend --follow