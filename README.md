# Hapi Boiler
## Description
This project is meant to be a boiler plate REST API server using Hapi Framework. It also contains following features

- Swagger Documentation for REST Endpoints
- Sample User Login and Sign Up using JWT tokens
- Braintree Integration
- Push notification service for Android and IOS
- Amazon S3 integration for user image uploads
- MySQL Database integration with connection pooling

### Project Requirements

- OS: Linux (recommended) or Windows
- Arch: Any
 
### Conventions

- All file and folder names must be in **snake_case**.
- All variable names must be in **camelCase**.
- All constants must be in **PascalCase**.
- Developer must adhere to .editorconfig and .eslintrc.json configurations, to have a consistent coding standard.
- According to the type of change being pushed, a commit message must contain [major], [minor], [refactor] or [fix] keyword.
  - [major] for any breaking change.
  - [minor] for feature additions.
  - [refactor] for refactoring existing code.
  - [fix] for any bug fixing.
- Developer must update this Document during Sprint 0 and update sections as per project requirement.

### Description

This is an Example Boiler Plate API server for Hapi JS. 

### Installation

Hapi Boiler requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ npm install -d
$ node app
```

For production environments...

```sh
$ npm install --production
$ npm run predeploy
$ NODE_ENV=production node app
``` 

### Configuration 

Before running, copy .sample_env as .env to application's root path. File .sample_env defines the correct environment file .env format. Update .env to use latest environment values

### Run

This application can be started through index.js.

  $ npm start 

### Documentation 

Documentation can be found on http(s)://<IP Address>:<PORT>/documentation

### Plugins

Following major plugins are used to extend Favorite Run

|Plugin|Usage| 
--------|-----------------
|aws-sdk|AWS Rest Client| 
|bcrypt|Crypto library|
|good|logger tool|
|hapi|NodeJS framework|
|hapi-swagger|Documentation generator|
|joi|Request validation|
|knex|Query building ( Usage Optional) |
|lodash|array manipulation|
|moment|date time manipulation |
|mysql|mysql driver|

### Project Structure
![Project Structure Code](https://image.ibb.co/hfp0Sw/Capture.png)

### Nvm Installation

Install a C++ Compiler

```sh
$ apt-get update
$ apt-get install build-essential libssl-dev
```
Visit [nvm latest](https://github.com/creationix/nvm/releases) for latest release version of NVM
```
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
$ source ~/.profile
$ nvm --version
```

### Node Installation
```
$ nvm install v6.8
$ nvm use v6.8
```

### MySQL Installation ( Ubuntu 16.04 or 17 )
```
$ sudo apt-get update 
$ sudo apt-get install mysql-server
$ mysql_secure_installation 
```
#####Check Service Status
```
$ sudo serivce mysql status
```
#####Now run schema.sql on your server to create hapi_boiler database

### Project Setup
```
$ cp .sample_env .env
$ npm install
$ npm start
```

### Nginx Installation & Configuration ( Optional - Only for Unix Deployment )

```sh
$ sudo apt-get update
$ sudo apt-get install nginx
// Run the following command to reveal your VPS's IP address
$ ifconfig eth0 | grep inet | awk '{ print $2 }'
// Open up the default virtual host file. Set server_name to IP Address from ifconfig command. 
$ sudo nano /etc/nginx/sites-available/default
server {
    listen <PORT_FOR_PUBLIC_ACCESS>;
    server_name <NAME>;
    location / {
        proxy_pass http://127.0.0.1:<PORT_ON_NODE_IS_RUNNING>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
// Start/ restart nginx server if running
$ sudo service nginx restart | start
```
