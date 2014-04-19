rterminal.js
============

Proof of concept of a javascript remote terminal with RabbitMQ.

Requirements
------------

* RabbitMQ installed and running
* Node.js and npm installed
* PHP and Composer installed

> Note that each component can be run on different machine. If you do so, you need to update the component(s) configuration accordingly.

Web server
---------

Clone this repository:

    git clone https://github.com/DjDCH/rterminal.js.git

Move yourself in the `webserver` directory

    cd rterminal.js/webserver

Install the dependencies with npm:

    npm install

Launch the app with node:

    node app.js

Remote daemon
-------------

Clone this repository:

    git clone https://github.com/DjDCH/rterminal.js.git

Move yourself in the `remotedaemon` directory

    cd rterminal.js/remotedaemon

Install the dependencies with Composer:

    composer install

Launch the daemon with php:

    php daemon.php

Known issues
------------

* php-amqplib does not have heartbeat implemented. Therefor, the connection will reset after a will.
* amqplib (amqp.node) seems to fail to send some messages in a queue, even if it says the opposite.
* No security or verification.

Disclaimer
----------

No security or verification mechanism is implemented. Do not even think to execute this in production. Use at your own risk. Provided only as a proof of concept.
