<?php

require_once __DIR__ . '/lib/setup.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

// FIXME: Need to handle process interruption to close the AMQP connection

$connection = new AMQPConnection($_server, $_port, $_user, $_pass);

$channel = $connection->channel();
$channel->queue_declare($_queue, false, false, false, false);

// Command callback
$callback = function($message) {
    $data = json_decode($message->body);
    _println(sprintf(' [x] Received `%s` `%s`', $data->command, $data->queue));

    // Output line callback
    $callback = function($line, $end, $channel, $queue) {
        $data = array('line' => $line, 'end' => $end);
        $message = new AMQPMessage(json_encode($data));

        $channel->basic_publish($message, '', $queue);
        _println(sprintf(' [x] `%s`: Sent `%s`', $queue, $line));
    };

    // Execute given command and invoke callback for each output line
    execute($data->command, $callback, $message->delivery_info['channel'], $data->queue);
};

$channel->basic_consume($_queue, '', false, true, false, false, $callback);

_println(' [*] Waiting for commands. To exit press CTRL+C');

while(count($channel->callbacks)) {
    $channel->wait();
}
