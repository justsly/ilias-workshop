<?php

function print_r_html($obj) {
    echo '<pre>' . print_r($obj, true) . '</pre>';
}

function keyValStrToKeyValArray($str, $keyDelimiter, $valueDelimiter) {
    $result = array();

    $params_arr = explode($keyDelimiter, $str);

    foreach ($params_arr as $k => $v) {
       $kv = explode($valueDelimiter, $v);

       if (count($kv) != 2)
           continue;

       $key = $kv[0];
       $val = $kv[1];

       $key = preg_replace('/[^a-zA-Z0-9_]/', '', $key);

       $result[$key] = $val;
    }

    return $result;
}

function checkLevelExists($lvl) {
    //POST Level to REST-API and get return or false
    //if false die else go to redirect

    //@todo fix funtion. until fix always true
    return true;
}

// make sure we have an action
if (!isset($_GET['action'])) {
  echo 'Invalid Request.';
  die;
}

// https://ilias.slycurity.de/ilias.php?ref_id=77&obj_id=7&active_node=7&cmd=edit&cmdClass=illmpagegui&cmdNode=jm:kb:jy:jo&baseClass=ilLMEditorGUI
if (!isset($_SERVER['HTTP_REFERER'])) {
    echo 'Invalid Access. Please navigate from ILIAS';
    die;
}

// get ilias params
$ref_query = explode('?', $_SERVER['HTTP_REFERER']);
if (count($ref_query) != 2) {
    echo 'Invalid Access. ILIAS Referer does not seem to be valid.';
    die;
}

$params = keyValStrToKeyValArray($ref_query[1], '&', '=');

// check for ref_id
if (!array_key_exists('ref_id', $params) || strlen($params['ref_id']) == 0) {
    echo 'Invalid Request. Missing paramter ref_id. Please navigate from ILIAS';
    die;
}

// check for object_id
if (!array_key_exists('obj_id', $params) || strlen($params['obj_id']) == 0) {
    echo 'Invalid Request. Missing paramter obj_id. Please navigate from ILIAS';
    die;
}


$ref_id = max(0, (int)$params['ref_id']);
$obj_id = max(0, (int)$params['obj_id']);


// make sure cookies are enabled and availabe
if (!isset($_COOKIE)) {
  echo 'Please enable cookies to proceed.';
  die;
}

// route to docker creation
if ($_GET['action'] == 'go') {
    // try to get session ID for automatic callback
    $sid = $_COOKIE['PHPSESSID'];

    if (strlen($sid) == 0) {
        echo 'Please enable cookies and log in to ILIAS first to proceed';
        die;
    }

    // check if sid is valid
    // @todo


    // get level arguments
    if (!isset($_GET['level'])) {
        echo 'Invalid Request. Mandatory argument "level" is missing.';
        die;
    }

    $level = $_GET['level'];

    //@todo catch injection
    if (strlen($level) == 0) {
        echo 'Invalid Request. Argument "level" has a wrong value.';
        die;
    }

    if(!checkLevelExists($level)) {
        echo 'Invalid Request. Level does not exist.';
        die;
    }


    // redirect user to docker page
    // http://192.168.56.101:8080/container/create/cmdi01/ref_id/77/page_id/7/
    $protocol = 'http://';
    $domain = '192.168.56.101';
    $port = '8080';
    $node = '/container/create/';

    $location = $protocol . $domain . ((strlen($port) > 0) ? ':' . $port : '') . $node . $level . '/ref_id/' . $ref_id . '/page_id/' . $obj_id;
    setcookie("uid", $sid, time()+60*60, '/', $domain);
    header("Location: " . $location);
    echo "Processing, please wait...";
    die('If your browser does not redirect. Navigate to: ' . $location);


}
?>