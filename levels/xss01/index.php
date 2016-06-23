<?php
include("./dbconnect.php");
include('./config.php');

if(isset($_GET['search'])) $search=$_GET['search'];
$db = new mysqli($servername,$dbuser,$dbpassword,'sqli');
if($db->connect_errno > 0){
	die("Connection failed: ".$db->connect_error);
}
if(isset($search) && $search != ""){
$db_search = "%".$search."%";
$sql = <<<SQL
SELECT inhalt
FROM posts
WHERE inhalt LIKE ?
SQL;
    if($stmt = $db->prepare($sql)){
	    $stmt -> bind_param("s", $db_search);
	    $stmt -> execute();
	    $stmt -> bind_result($datarows);
    }
} else {
$sql = <<<SQL
SELECT inhalt
FROM posts
SQL;
    if($stmt = $db->prepare($sql)){
	    $stmt -> execute();
	    $stmt -> bind_result($datarows);
    }
}
$suchmuster = '/.*<script[^>]*?>alert\([\s\S]+?\)[;]{0,1}<\/script>.*/';
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
    <?php
        echo "<script>";
        echo "var srv_ip='".$srv_ip."';";
        echo "var srv_port='".$srv_port."';";
        echo "</script>";
    ?>
  </head>
  <body>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
	<div class="container">
	  <span class="brand"><a href="/">Web Security Workshop</a></span>
	  <button class="btn" style="float:right;" id="quit_work">Bearbeitung unterbrechen</button>
	</div>
      </div>
    </div>
    <div class="container">
    	<h3>Reflected Cross-Site-Scripting</h3>
    	<form class="well form-horizontal" method="get">
        	    <div class="control-group">
        	    <label class="control-label" for="search">Suchbegriff</label>
        	    <div class="controls">
        	    <input type="text" name="search"/>
        	    <button type="submit" class="btn" value="clicked">suchen</button>
        	    </div></div>
        </form>
		<?php
		 if(isset($search) && $search != ""){
		    echo "<p>Sie haben nach <b>".$search."</b> gesucht!</p>";
		    echo "<pre>";
		    while ($stmt->fetch()) {
                printf ("%s", $datarows);
                echo "<br />";
            }
            echo "</pre>";
		 	$stmt -> close();
			if (preg_match($suchmuster, $search)) include('./xss_infos.php');
		 }
		 else {
			echo "<p class='text-warning'>Bitte einen Suchbegriff eingeben.</p>";
			echo "<pre>";
            while ($stmt->fetch()) {
                printf ("%s", $datarows);
                echo "<br />";
            }
            echo "</pre>";
            $stmt -> close();
		 }
		?>
	    <p>
		<small>
		    Kann die Suchfunktion manipuliert werden?
		</small>
	    </p>
	    <?php
            if(isset($db)) $db->close();
        ?>
    </div>


    <script src="jquery/jquery-1.12.1.min.js"></script>
    <script>
    	$("#quit_work").click(function(){
    	    $.ajax({
               	url: 'http://' + srv_ip + srv_port + '/container/' + getCookie('dockerHash') + '/end/',
               	type: 'DELETE',
               	success: function(result) {
                    if(result.return_url) window.location = result.return_url + "&lti_msg=" + result.return_msg;
                    else {
                        alert(result.return_msg + '\nDer Container wird nun geschlossen.');
                        window.close();
                    }
                },
                error: function(){
                    alert("Error Occured! Please Try again.");
                }
            });
    	});
    </script>
  </body>
</html>