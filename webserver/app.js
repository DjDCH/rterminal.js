// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var amqp = require('amqplib');

var port = process.env.PORT || 8080;

var host = 'amqp://localhost:5672?heartbeat=30';
var queue = 'commands';

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

amqp.connect(host).then(function(connection) {

//    return connection.createChannel().then(function(channel) {
    return connection.createConfirmChannel().then(function(channel) {

        process.once('SIGINT', function() {
            console.log(' [*] Closing channel...');
            channel.close();

            console.log(' [*] Closing connection...');
            connection.close();
        });

        return channel.assertQueue(queue, { durable: false }).then(function() {

            io.on('connection', function(socket) {
                socket.on('command', function (data) {

                    channel.assertQueue(null, { durable: false, autoDelete: true }).then(function(promise) {
                        var consumerTag;

                        channel.consume(promise.queue, function(message) {
                            var json = JSON.parse(message.content.toString());
                            console.log(' [x] Received `%s` with end: %s', json.line, json.end);

                            // If not the end or if line is not empty
                            if (!json.end || json.line) {
                                // Send update to command sender
                                socket.emit('console', {
                                    line: json.line,
                                    end: false
                                });
                            }

                            // Cancel consumer if command ended (will trigger queue deletion)
                            if (json.end) {
                                channel.cancel(consumerTag);
                                console.log(' [x] Canceling consumer `%s` from queue `%s`', consumerTag, promise.queue);

                                socket.emit('console', {
                                    line: '',
                                    end: true
                                });
                            }
                        }, { noAck: true }).then(function(promise) {
                            consumerTag = promise.consumerTag;
                        });

                        var data2 = {
                            command: data.command,
                            queue: promise.queue
                        };

                        // Ensure that queue is still available
                        channel.assertQueue(queue, { durable: false }).then(function() {
                            channel.sendToQueue(queue, new Buffer(JSON.stringify(data2)), {}, function(err, ok) {
                                if (err !== null) {
                                    console.warn(' [*] Message nacked');
                                } else {
                                    console.log(' [*] Message acked');
                                }
                            });
//                            .then(function() {
//                                console.log(' [x] Acknowledged!');
//                            });
                            console.log(' [x] Sent `%s`', data2.command);
                        });
                    });
                });
            });

            console.log(' [*] Waiting for messages and connections. To exit press CTRL+C');
        });
    });
}).then(null, console.warn);
