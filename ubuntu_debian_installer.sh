#!/bin/sh
echo " _  _ _  _ _  _ _    ____    "
echo " |__| |  | |\/| |    |__|    "
echo " |  | |__| |  | |___ |  |    "
echo "==========================   "
echo "Humla is an open source presentation & lecture hosting environment based on node.js server. As a presentation frontend, or as we call it a 'client', it uses beautiful HTML5 slides inspired by HTML5Rocks, but with many extra features (Comments, Likes, Tests, Faceted navigation etc.) "
echo " "
echo "Authors: Tomas Vitvar, Petr Mikota, Vladimir Riha, Vojtech Smrcek"
echo "Humla Installer by Vladimir Riha"
echo "Check newest stuff on our website https://github.com/bubersson/humla"
echo " "
echo "This installer will install following software (if not already present):"
echo "  - curl, nodejs, npm, npm modules, download MongoDB"
echo "Do you want to install Humla and all dependencies? (y/n):"

read ctd

 if [ "$ctd" = "y" ]; then
    	echo "Starting installation..."
    else
    	echo "Installation canceled..."
    	exit 1
    fi

 if [ "$(id -u)" != "0" ]; then
    echo "$0 must be run as root..."
    exit 1
  fi

cd ~
if [ "${#1}" -gt 0 ]; then
if [ -d "$1" ]; then
    echo "Directory already exist..."
    exit 1
fi

if command -v g++ >/dev/null 2>&1; then
	echo "g++ installed..."
else
	echo "g++ is not installed. Some npm modules require it. Do you want to install it? (y/n)"
	read gres
	 if [ "$gres" = "y" ]; then
    	echo "Installing g++..."
    	sudo apt-get install g++
    	echo "... g++ installed"
    else
    	echo "cancelling installation. Please install g++ first..."
    	exit 1
    fi
 	
fi


if command -v curl >/dev/null 2>&1; then
    echo "cURL already installed, skipping cURL installation..."
else
    echo "cURL is missing, do you want to install it? (y/n):"
    read res
    if [ "$res" = "y" ]; then
    	echo "Installing cURL..."
    	sudo apt-get install curl
    	echo "... cURL installed"
    else
    	echo "Installation canceled..."
    	exit 1
    fi
fi

mkdir $1 && cd ./$1

# GETTING HUMLA FROM GITHUB
echo "Retrieving Humla..."
if command -v git >/dev/null 2>&1; then
	git clone https://github.com/bubersson/humla.git
else
	echo >&2 "No git found, trying to use cURL to download archive instead..."
	curl -L https://github.com/bubersson/humla/tarball/master > master.tar.gz
	archive=master.tar.gz
    mkdir ${archive%.tar*} 
    tar --extract --file=${archive} --strip-components=1 --directory=${archive%.tar*}
	mv master humla
	rm master.tar.gz
fi

echo "\nHumla retrieved from github..."

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
		echo "\nNode.JS installed..."
	fi

# NPM INSTALLATION
if command -v npm >/dev/null 2>&1; then
	# NPM EXISTS
	echo "npm command found, skipping npm installation. Make sure following modules are installed: express, mongoose, jsdom, cron, passport, passport-local and passport-google..."
	else
		echo "Installing npm..."
		curl http://npmjs.org/install.sh | sudo sh
		npm install express
		npm install mongoose
		npm install jsdom
		npm install cron
		npm install passport
		npm install passport-local
		npm install passport-google
		echo "\nNPM installed..."
	fi

# MONGO DB
    echo "Downloading MongoDB..."
    curl -L http://downloads.mongodb.org/linux/mongodb-linux-i686-1.6.4.tgz > mongo.tgz
	archive=mongo.tgz
    mkdir ${archive%.tgz*} 
    tar --extract --file=${archive} --strip-components=1 --directory=${archive%.tgz*}
	rm mongo.tgz
	
	## data directory
	sudo mkdir -p ./db/humla/
	sudo chown `id -u` ./db/humla

	echo "MongoDB ready, to start it run './mongo/bin/mongod --dbpath ~/$1/db/humla --oplogSize 200 --smallfiles'"

USERNAME=`logname`
GROUP=`id -g -n $USERNAME`

sudo chown $USERNAME:$GROUP ~/$1 ~/$1/humla ~/$1/mongo

echo "\n\nInstallation complete, start database and then go to ~/$1 and run 'node index.js'"

else
	echo "\nSpecify target directory!"
	exit 1
fi