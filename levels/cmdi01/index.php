<?php
if(isset($_GET['doc'])) $doc = $_GET['doc'];
?>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Command Injection</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="/css/style.css" rel="stylesheet">
    <style>
      body {
	padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
    </style>
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
    	<h3>Command Injection</h3>
		 <p class='text-info'>Folgende Dateien kannst du anschauen: 
		 <br />Zeitplan.txt
		 <br />Kuchenrezept.txt</p>
	    <form class="well form-horizontal" method="get">
	    <div class="control-group">
	    <label class="control-label" for="doc">Welche Datei willst du sehen?</label>
	    <div class="controls">
	    <input type="text" name="doc"/>
	    <button type="submit" class="btn">Submit</button>
  	    </div></div>
	    </form>
	    <p><?php 
		if(isset($doc)){
			if($doc == '../../sqli/dbconnect' || $doc == '../../user_reg/dbconnect') echo "<p class='text-success'>Sehr gute Idee. Und hätten wir nicht daran gedacht, so wärst du nun im Besitz der Datenbank. Komm vor und hol dir einen Keks ab! :-)</p><p><center><img src='../../pics/accessdb.jpg'/></center></p>"; 
			elseif($doc == 'index.php') echo "<p class='text-info'>Gute Idee. Aber wir wollen hier jetzt nicht unseren Quellcode verraten ;-)</p>";
			else system("cat ".$doc);
		} 
		?></p>
	    <p>
		<small>
			Wir sind total die Gutmenschen und stellen unsere perfekte Arbeit allen zur Verfügung <a href=index.txt>OpenSource4Life</a>
		</small>
	    </p>

	   <p class="text-warning">Hint: Ob man auch andere Dateien ansehen kann?</p>
    </div>


  </body>
</html>
