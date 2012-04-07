#!/bin/sh
cd ~
if [ "${#1}" -gt 0 ]; then
if [ -d "$1" ]; then
    echo "Directory already exist..."
    exit;
fi
mkdir $1 && cd ./$1

# GETTING HUMLA FROM GITHUB

	if command -v git >/dev/null 2>&1; then
	git clone https://github.com/bubersson/humla.git
else
	echo >&2 "No git found, trying to use wget to download archive instead..."
	curl https://github.com/bubersson/humla/tarball/master > master.tar.gz
	archive=master.tar.gz
    mkdir ${archive%.tar*} 
    tar --extract --file=${archive} --strip-components=1 --directory=${archive%.tar*}
	mv master humla
	rm master.tar.gz
fi

echo "\n Humla retrieved from github..."

# NODE INSTALLATION
if command -v node >/dev/null 2>&1; then
	# NODE EXISTS
	echo "node command found, skipping node installation..."
	else
		echo "Installing python-software-properties..."
		sudo apt-get install python-software-properties
		echo "Adding nodejs ppa..."
		sudo add-apt-repository ppa:chris-lea/node.js
		echo "Updating ppa..."
		sudo apt-get update
		echo "Installing nodejs..."
		sudo apt-get install nodejs
		#echo "Installing nodejs-dev"
		#sudo apt-get install nodejs-dev
		echo "\n Node.JS installed..."
	fi

# NPM INSTALLATION
if command -v npm >/dev/null 2>&1; then
	# NPM EXISTS
	echo "npm command found, skipping npm installation. Make sure following modules are installed: express, mongoose, jsdom, cron, passport, passport-local and passport-google..."
	else
		curl http://npmjs.org/install.sh | sudo sh
		npm install express
		npm install mongoose
		npm install jsdom
		npm install cron
		npm install passport
		npm install passport-local
		npm install passport-google
		echo "\n NPM installed..."
	fi

# MONGO DB
    echo "Downloading MongoDB..."
    curl http://downloads.mongodb.org/linux/mongodb-linux-i686-1.6.4.tgz > mongo.tgz
	archive=mongo.tgz
    mkdir ${archive%.tar*} 
    tar --extract --file=${archive} --strip-components=1 --directory=${archive%.tar*}
	rm mongo.tgz
	
	## data directory
	sudo mkdir -p ./humladb/
	sudo chown `id -u` ./humladb

	echo "MongoDB ready, to start it run './mongo/bin/mongod --dbpath ~/$1/humladb --oplogSize 200 --smallfiles'"

echo "Installation complete, start database and then go to ~/$1 and run 'node index.js'"

else
	echo "\n Specify target directory!"
	exit;
fi