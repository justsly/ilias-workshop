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
<p class="text-success">Sehr gut! Du hast die geheime Datei gefunden. Das Geheimnis lautet: <b>56e3c74c89ef6c909f80c40e065d7269</b></p>
<button class="btn" id="button0">L&ouml;sung einreichen</button>

<button class="btn" id="button1">Container beenden</button>

<script>
	$("#button0").click(function(){
	$.ajax({
		url: 'https://ilias.slycurity.de/ilias.php?ref_id=' + getCookie('ref_id') + '&page_id=' + getCookie('page_id') + '&cmd=processAnswer&cmdClass=illmpagegui&cmdNode=jp:jo&baseClass=ilLMPresentationGUI&cmdMode=asynch',
		type: 'POST',
		data: '{"tries":1,"wrong":0,"passed":true,"answer":[true],"interactionId":null,"choice":["56e3c74c89ef6c909f80c40e065d7269"],"isBestSolution":true}',
		success: function(result) {
			console.log(result);
		}	
	});
	});
	$("#button1").click(function(){
	$.ajax({
    		url: 'http://192.168.56.101:8080/container/' + getCookie('dockerHash') +'/end/',
    		type: 'DELETE',
    		success: function(result) {
			window.close();
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
