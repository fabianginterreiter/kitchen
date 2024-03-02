# kitchen (planner)

uname -m
https://nodejs.org/en/download/

wget https://nodejs.org/dist/v20.11.1/node-v20.11.1-linux-armv7l.tar.xz


tar -xf node-v20.11.1-linux-armv7l.tar.xz


cd node-v20.11.1-linux-armv7l

sudo cp -R * /usr/local/

/usr/local/bin/npm install

/usr/local/bin/node server.mjs 

sudo apt install postgresql

sudo su postgres

createuser fabian -P --interactive


psql

CREATE DATABASE kitchen;

exit


/usr/local/bin/npm install pg