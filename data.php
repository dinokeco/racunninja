<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	try{
      $pdo = new PDO("mysql:host=srv10.domenice.net;dbname=asd;charset=utf8", "asd", "sad", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]);
		$prepared_statement = $pdo->prepare('SELECT * FROM countries;');
		$prepared_statement->execute();
		$students = $prepared_statement->fetchAll();
		echo json_encode($students);
    }catch(PDOException  $e ){
      echo "Error: ".$e;
    }
?>