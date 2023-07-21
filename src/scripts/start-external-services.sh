# MySQL 8
echo "Starting MySQL 8"
docker run --name tunnelmole_mysql -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=password -d mysql:8.0.32 
