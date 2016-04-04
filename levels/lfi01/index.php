<?php
if(isset($_GET['page'])){
	$page = $_GET['page'];
}
?>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Local File Inclusion</title>
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
    	<h3>Local File Inclusion</h3>
		<div class="navbar navbar-inverse">
			<div class="navbar-inner">
				<div class="container">
					<span class="brand"><a href="index.php">Home</a></span>
					<span class="brand"><a href="?page=page1">Page1</a></span>
					<span class="brand"><a href="?page=page2">Page2</a></span>
					<span class="brand"><a href="?page=page3">Page3</a></span>
				</div>
			</div>
		</div>		 
	    <p><?php 
		if(isset($page)){
			include("./includes/".$page);
		}
		else echo "Wilkommen auf dieser genial programmierten Seite!";
		?></p>
	    <p>
		<small>
			Wir sind total die Gutmenschen und stellen unsere perfekte Arbeit allen zur Verfügung <a href=index.txt>OpenSource4Life</a>
		</small>
	    </p>

	   <p class="text-warning">Sichere Includes durch fest definierten Include Pfad. Wirklich sicher?</p>
    </div>


  </body>
</html>