<?php

$_start = microtime(true);

$_server = 'localhost';
$_port = 5672;
$_user = 'guest';
$_pass = 'guest';
$_queue = 'commands';

//ini_set('memory_limit','512M');
ini_set('display_errors', 1);
error_reporting(-1);

mb_internal_encoding('UTF-8');

require_once __DIR__ . '/../vendor/autoload.php';
require_once 'functions.php';
