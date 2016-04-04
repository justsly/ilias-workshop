<?php
include('./config.php');
include('./dc_secret.php');

echo "<script>";
echo "var srv_ip='".$srv_ip."';";
echo "var srv_port='".$srv_port."';";
echo "var dc_secret='".$dc_secret."';";
echo "</script>";
?>
<p class="text-success">Lernziel erreicht. Du hast die Reflected Cross-Site-Scripting Schwachstelle erfolgreich ausgenutzt.</p>

<p><button class="btn" id="complete_level">Aufgabe einreichen!</button></p>

<script src="jquery/jquery-1.12.1.min.js"></script>
<script>
	$("#complete_level").click(function(){
	    $.ajax({
		    url: 'http://' + srv_ip + srv_port + '/container/' + getCookie('dockerHash') + '/complete/secret/' + dc_secret,
		    type: 'GET',
		    success: function(result) {
			    console.log(result);
			    $.ajax({
                	url: 'http://' + srv_ip + srv_port + '/container/' + getCookie('dockerHash') + '/end/',
                	type: 'DELETE',
                	success: function(result) {
                        window.location = result.return_url + "&lti_msg=Lernziel erreicht!";
                    },
                    error: function(){
                        alert("Error Occured! Please Try again.");
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