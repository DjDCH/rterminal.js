$(function() {
    var $butons = $('div.command-buttons');
    var commands = [
        'echo',
        'hostname',
        'ls -la',
        'tree',
        'date',
        'cal',
        'ping -c 4 google.ca',
        'traceroute google.ca'
    ];

    // Generate buttons
    for (var key in commands) {
        $butons.append('<p><button type="button" class="btn btn-primary send-command" data-content="' + commands[key] + '">' + commands[key] + ' <span class="glyphicon glyphicon-chevron-right"></span></button></p>');
    }

    var $content = $('pre.content');
    var $btnSend = $('button.send-command');
    var $btnClear = $('button.clear-console');
    var $btnStatus = $('button.connection-status');

    var socket = io.connect('http://localhost:8080');

    function prompt() {
        $content.append('web@server:~$ ');
    }

    socket.on('console', function(data) {
        if (!data.end) {
            $content.append(data.line + "\n");
        } else {
            prompt();
            $btnSend.removeAttr('disabled');
            $btnClear.removeAttr('disabled');
        }

        $content.scrollTop($content.prop('scrollHeight'));
    });

    socket.on('connect', function(data) {
        $btnStatus.removeClass('btn-default btn-primary btn-success btn-info btn-warning btn-danger btn-link');
        $btnStatus.addClass('btn-success');
        $btnStatus.html('Online <span class="glyphicon glyphicon-ok"></span>');
    });

    socket.on('disconnect', function(data) {
        $btnStatus.removeClass('btn-default btn-primary btn-success btn-info btn-warning btn-danger btn-link');
        $btnStatus.addClass('btn-danger');
        $btnStatus.html('Offline <span class="glyphicon glyphicon-remove"></span>');
    });

    $btnSend.on('click', function() {
        $btnSend.attr('disabled', 'disabled');
        $btnClear.attr('disabled', 'disabled');
        socket.emit('command', {
            command: $(this).attr('data-content')
        });
        $content.append($(this).attr('data-content') + "\n");
    });

    $btnClear.on('click', function() {
        $content.empty();
        setTimeout(function() { // Only for effect
            prompt();
        }, 500);
    });

    setTimeout(function() { // Only for effect
        prompt();
    }, 500);
});
