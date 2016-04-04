<?php
if(isset($_GET['id'])){
	$id = $_GET['id'];
include("./dbconnect.php");
$db = new mysqli($servername,$dbuser,$dbpassword,'sqli');
if($db->connect_errno > 0){
        die("Connection failed: ".$db->connect_error);
}
$db->set_charset("utf8");
$sql = <<<SQL
SELECT inhalt
FROM posts
WHERE id = '$id'
SQL;
if($result = $db->query($sql)){
        $rows = $result->num_rows;
        $result->data_seek(0);
        $datarow = $result->fetch_array();
} else {
        echo $db->error;
}
}

?>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>SQL Injection</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="BB">
    <link href="/css/style.css" rel="stylesheet">
  </head>

  <body>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
	<div class="container">
	  <span class="brand"><a href="/">Web Security Workshop</a></span>
	</div>
      </div>
    </div>
    <div class="container">
    	<h3>SQL Injection 2</h3>
		<div class="navbar navbar-inverse">
			<div class="navbar-inner">
				<div class="container">
					<span class="brand"><a href="index.php">Home</a></span>
					<span class="brand"><a href="?id=1">Page1</a></span>
					<span class="brand"><a href="?id=2">Page2</a></span>
					<span class="brand"><a href="?id=3">Page3</a></span>
					<span class="brand"><a href="admin.php">Adminbereich</a></span>
				</div>
			</div>
		</div>		 
	    <p><?php 
		if(isset($id)){
			echo $datarow[0];
		}
		else echo "Wilkommen auf dieser genial programmierten Seite!";
		?></p>
	    <p>
		<small>
			Wir sind total die Gutmenschen und stellen unsere perfekte Arbeit allen zur Verfügung <a href=index.txt>OpenSource4Life</a>
		</small>
	    </p>

	   <p class="text-warning">So diesmal ist der Adminbereich safe! Niemals kommst du da rein!</p>
    </div>


  </body>
</html>
