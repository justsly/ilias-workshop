<?php
include("./dbconnect.php");
if(isset($_GET['search'])) $search=$_GET['search'];
if(isset($search) && $search != ""){
$db = new mysqli($servername,$dbuser,$dbpassword,'sqli');
if($db->connect_errno > 0){
	die("Connection failed: ".$db->connect_error);
}
$sql = <<<SQL
SELECT inhalt
FROM posts
WHERE inhalt LIKE '%?%'
SQL;
if($stmt = $db->prepare($sql)){
	$stmt -> bind_param("s", $search);
	$stmt -> execute();
	$stmt -> bind_result($datarows);
}
$sql2 = <<<SQL
SELECT inhalt
FROM posts
SQL;
if($stmt2 = $db->prepare($sql2)){
	$stmt2 -> execute();
	$stmt2 -> bind_result($datarows2);
}
}

$suchmuster = '/<script[^>]*?>alert\([\s\S]+?\)<\/script>/';

?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Reflected Cross-Site-Scripting</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="BB">
    <link href="css/style.css" rel="stylesheet">
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
    	<h3>Reflected Cross-Site-Scripting</h3>
		<?php
		 if(isset($search) && $search != ""){
		    echo "Sie haben nach ".$search." gesucht!";
		    echo "<br />";
		    while ($stmt->fetch()) {
                printf ("%s", $datarows);
                echo "<br />";
            }
		 	$stmt -> close();
			if (preg_match($suchmuster, $search)) include('./xss_infos.php');
		 }
		 else {
			echo "<p class='text-warning'>Bitte einen Suchbegriff eingeben.</p>";
            while ($stmt2->fetch()) {
                printf ("%s", $datarows2);
                echo "<br />";
            }
            $stmt2 -> close();
		 }
		?>
	    <form class="well form-horizontal" method="get">
	    <div class="control-group">
	    <label class="control-label" for="search">Suchbegriff</label>
	    <div class="controls">
	    <input type="text" name="search"/>
	    </div></div>
	    <button type="submit" class="btn" value="clicked">suchen</button>
	    </form>
	    <p>
		<small>
		    Kann die Suchfunktion manipuliert werden?
		</small>
	    </p>
	    <?php
            if(isset($db)) $db->close();
        ?>
    </div>
  </body>
</html>