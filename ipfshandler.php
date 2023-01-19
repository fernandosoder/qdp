<?php

error_reporting(E_ALL);
if ($_FILES["uploadfile"]["error"] == 0) {
    $target_url = "http://127.0.0.1:5001/api/v0/add?stream-channels=true&pin=false&wrap-with-directory=true&arg=/file&progress=false";
    $content = file_get_contents($_FILES["uploadfile"]["tmp_name"]);
    $post = array('file' => $content);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $target_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $result = curl_exec($ch);
    curl_close($ch);
    header("Content-Type: application/json");
//    header("Content-Type: text/plain");

    $cpUrl = "http://127.0.0.1:5001/api/v0/files/cp?arg=/ipfs/" . json_decode(explode("\n", $result)[0])->Hash . "&arg=/files/" . time() . "." . end(explode(".", $_FILES["uploadfile"]["name"]));

    $ch2 = curl_init();
    curl_setopt($ch2, CURLOPT_URL, $cpUrl);
    curl_setopt($ch2, CURLOPT_POST, 1);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    $result2 = curl_exec($ch2);
    curl_close($ch2);
    
    echo ((explode("\n", $result)[0]));
//    echo "\n\n";
//    print_r($result2);
    exit();
}

http_response_code(413);

//print_r($_FILES);