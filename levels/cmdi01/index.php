<?php
if(isset($_GET['ip'])) $ip = $_GET['ip'];
?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link href="/css/style.css" rel="stylesheet">
    <title>Command Injection</title>
  </head>
  <body>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
	    <div class="container">
	        <span class="brand"><a href="#">Web Security Workshop</a></span>
	    </div>
      </div>
    </div>
    <div class="container">
    	<h3>Command Injection</h3>
		<p class='text-info'>The ultimate ping system</p>
	    <form class="well form-horizontal" method="get">
	        <div class="control-group">
	            <label class="control-label" for="ip">Was willst du pingen?</label>
	            <div class="controls">
	                <input type="text" name="ip"/>
	                <button type="submit" class="btn">Submit</button>
  	            </div>
  	        </div>
	    </form>
	    <p>
	    <?php
		if(isset($ip)){
			system("ping -c 3 ".$ip);
		} 
		?></p>
	    <p>
		<small>
			Wir sind total die Gutmenschen und stellen unsere perfekte Arbeit allen zur Verfügung <a href=index.txt>OpenSource4Life</a>
		</small>
	    </p>

	   <p class="text-warning">Hint: Kann hier wirklich nur ping benutzt werden?</p>
    </div>
  </body>
</html>
