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

createuser kitchen -P --interactive


psql

CREATE DATABASE kitchen;

exit


/usr/local/bin/npm install pg

....


sudo npm install -g pm2

pm2 startup systemd

sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u fabian --hp /home/fabian

pm2 save

http://raspberrypi.fritz.box:4000/recipes


ngninx

sudo apt install nginx

sudo vi /etc/nginx/sites-available/default

server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
            proxy_pass http://localhost:4000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
}

sudo nginx -t


sudo systemctl restart nginx


NODE_ENV=production pm2 restart server --update-env



## Open Postgres for external access

/etc/postgresql/12/main/postgresql.conf 

Then, find the line #listen_addresses = 'localhost' and uncomment it (remove the # character at the beginning of the line).

Next, change the value of “listen_addresses” to “*”. This allows PostgreSQL to listen on all available IP addresses.

sudo vi /etc/postgresql/13/main/pg_hba.conf 

# IPv4 local connections: 
host    all             all             127.0.0.1/32            md5 

And modify it this way: 

# IPv4 local connections:
host    all             all             0.0.0.0/0            md5 


sudo /etc/init.d/postgresql restart

sudo netstat -tulpn | grep LISTEN 

-> port 5432