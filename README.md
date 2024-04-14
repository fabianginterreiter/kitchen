# kitchen (planner)

## Deploy on Raspberry PI

```
ssh user@<ip>
```

### NodeJS

Get the Architecture:

```
uname -m
```

Got to [NodeJS](https://nodejs.org/en/download/prebuilt-binaries), select your environment (e.g aarch64) and look for the download link. Right Click -> Copy Link (e.g. https://nodejs.org/dist/v20.12.2/node-v20.12.2-linux-arm64.tar.xz )

Download NodeJS and unpack it:
```
wget https://nodejs.org/dist/v20.12.2/node-v20.12.2-linux-arm64.tar.xz
tar -xf node-v20.12.2-linux-arm64.tar.xz
```

Go to node directory and copy to local:
```
cd node-v20.12.2-linux-arm64
sudo cp -R * /usr/local/
```

### Install Postgresql

sudo apt install postgresql

sudo su postgres

createuser kitchen -P --interactive

psql

CREATE DATABASE kitchen;

exit

#### Open Postgres for external access

/etc/postgresql/12/main/postgresql.conf 

Then, find the line #listen_addresses = 'localhost' and uncomment it (remove the # character at the beginning of the line).

Next, change the value of “listen_addresses” to “*”. This allows PostgreSQL to listen on all available IP addresses.

sudo vi /etc/postgresql/15/main/pg_hba.conf 

host    all             all             0.0.0.0/0             scram-sha-256


sudo /etc/init.d/postgresql restart

### Install Kitchen Planner

```
git clone https://github.com/fabianginterreiter/kitchen.git

/usr/local/bin/npm install
```

/usr/local/bin/node server.mjs 


/usr/local/bin/npm install pg

Update knexfile.js

### PM2


sudo npm install -g pm2

NODE_ENV=production pm2 start server.mjs --name kitchen -i 2 --update-env

pm2 startup systemd

sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u fabian --hp /home/fabian

pm2 save

NODE_ENV=production pm2 start server.mjs --name kitchen -i 2 --update-env


### nginx

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




