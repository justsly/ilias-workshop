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
WHERE inhalt LIKE '$search'
SQL;
if($result = $db->query($sql)){
	$rows = $result->num_rows;
}
$sql2 = <<<SQL
SELECT inhalt
FROM posts
SQL;
if($result2 = $db->query($sql2)){
    $rows2 = $result2->num_rows;
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
		 	if(isset($rows)){ 
				if($rows >= 1){
		 			while($row = $result->fetch_array())
                    {
                        echo $row[2];
                        echo "<br />";
                    }
		 			$result->free();
		 		}
		 	}
			else{
				echo "<p class='text-warning'>Keine Treffer zum gewünschten Begriff gefunden.</p>";
			}
			if (preg_match($suchmuster, $search)) include('./admin_infos.php');
		 }
		 else {
			if(isset($search)){
				echo "<p class='text-warning'>Bitte einen Suchbegriff eingeben.</p>";
				if(isset($rows)){
                	if($rows2 >= 1){
                		 while($row2 = $result2->fetch_array())
                         {
                            echo $row2[2];
                            echo "<br />";
                         }
                		 $result2->free();
                	}
                }
			}
			else{
		 		echo "<p class='text-info'>Hier kannst du die Seite durchsuchen.</p>";
			}
		 }
		?>
	    <form class="well form-horizontal" method="get">
	    <div class="control-group">
	    <label class="control-label" for="search">Suchbegriff</label>
	    <div class="controls">
	    <input type="text" name="search"/>
	    </div></div>
	    <button type="submit" class="btn" value="clicked">suchen</button>
	    </div></div>
	    </form>
	    <p>
		<small>
		    Kann die Suchfunktion manipuliert werden?
		</small>
	    </p>
    </div>
  </body>
</html>