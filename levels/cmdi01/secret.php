<?php
include_once('./config.php');

echo "<script>";
echo "var srv_ip=".$srv_ip;
echo "var srv_port=".$srv_port;
echo "</script>";
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="secret file">
    <meta name="author" content="BB">
    <link href="/css/style.css" rel="stylesheet">
    <script src="jquery/jquery-1.12.1.min.js"></script>
    <title>This is so secret</title>
</head>
<body>
<p class="text-success">Sehr gut! Du hast die geheime Datei gefunden.</p>

<button class="btn" id="complete_level">Aufgabe einreichen!</button>

<script>
	$("#complete_level").click(function(){
	    $.ajax({
		    url: 'http://' + srv_ip + srv_port + '/container/' + getCookie('dockerHash') + '/complete/',
		    type: 'GET',
		    success: function(result) {
			    console.log(result);
			    $.ajax({
                	url: 'http://' + srv_ip + srv_port + '/container/' + getCookie('dockerHash') + '/end/',
                	type: 'DELETE',
                	success: function(result) {
            		    window.close();
                	}
            	});
		    }
	    });
	});
	function getCookie(cname) {
    		var name = cname + "=";
    		var ca = document.cookie.split(';');
    		for(var i=0; i<ca.length; i++) {
        		var c = ca[i];
        		while (c.charAt(0)==' ') c = c.substring(1);
        		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    		}
    		return "";
}
</script>
</body>
</html>
