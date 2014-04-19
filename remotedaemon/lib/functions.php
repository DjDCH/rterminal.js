<?php

function _println($string)
{
    echo $string . "\n";
}

function execute($command, $callback)
{
    // Get args to send to callback and remove first and second args
    $args = func_get_args();
    array_shift($args);
    array_shift($args);

    $process = popen($command, 'r');

    if (is_resource($process)) {
        while (($line = fgets($process)) !== false) {
            $line = str_replace("\n", '', $line); // Strip line feed
            call_user_func_array($callback, array_merge(array($line, false), $args));
        }
        if (!feof($process)) {
            echo "Error: Unexpected fgets() fail\n";
        }
    } else {
        echo "Error: Unable to start process\n";
    }

    pclose($process);

    call_user_func_array($callback, array_merge(array('', true), $args));
}
