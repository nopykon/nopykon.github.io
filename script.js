'use strict';

function $(id){ return document.getElementById(id) }

function load_script(file) {
    // DOM: Create the script element
    let el = document.createElement( 'script' );
    el.type = "text/javascript";
    el.src = file;
    document.body.appendChild(el);
}


function play_tune()
{
	load_script('audio.js');
	
	$("playbutton").onclick = function (){
		stop_tune()
		$("playbutton").onclick = play_tune;
		$("playbutton").innerHTML = 'Play!' ;
	};	
	$("playbutton").innerHTML = 'Stop' ;
}
function on_stop_tune()
{
	$("playbutton").onclick = play_tune;
	$("playbutton").innerHTML = 'Play!' ;
}

function load(O)
{
	let xhttp = new XMLHttpRequest();
	xhttp.responseType = 'text' ;
	xhttp.onreadystatechange = function() {	
		//hmm, probably broken
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			O.vis = 1;
			O.info = xhttp.responseText ;
			$( O.did ).innerHTML = xhttp.responseText ;
			$( O.bid ).innerHTML = "hide" ;
		}
		O.working = false;
	};
	xhttp.open("GET", O.src, true);
	xhttp.send();
	
}

function toggle_func( O )
{
	if(O.working)
		return;

	if(0 === (O.vis^=1) ) // hide
	{
		$( O.did).innerHTML = "";
		$( O.bid).innerHTML = "show" ;
	}
	else if( O.info !== null) //show, already loaded
	{
		$( O.did ).innerHTML = O.info;
		$( O.bid ).innerHTML = "hide" ;
	}
	else //load and show
	{
		O.working = true;
		load(O)
	}
}

function scroll_open(O)
{
	if(!O.vis)
		toggle_func(O)
	$(O.bid).scrollIntoView()
}

function section( name )
{
	return {
		src: name + '.html',
		bid: 'show_' + name,
		did: name,
		info: null,
		vis:0,
		working:false,
		toggle: function(){	toggle_func(this);	}
	}
}

let code = section('programming');
let projects = section('projects');
let js13k = section('js13k');
let games = section('games');
let art = section('art');
let music = section('music');
let about = section('about');
let tic = section('tic');





/*

  Image viewer


//let VIEWING = false;
function zoom(src)
{
	let e = document.getElementById("BACON"); 

	if( e === null )
	{
		console.log("view image");
		e = document.createElement("DIV"); 
		
		e.id = "BACON";
		e.innerHTML = 
			'<div id="TEMPORARY"' +
			'style="position:fixed;left:0; top:0; width:100%; height:100%;">' +
			'<img src="old_site/fps_painting.jpg" onclick="zoom(0)">' + 
			'</div>';
		
		document.body.appendChild(e);
	}
	else
	{
		document.body.removeChild(e);
		console.log("CLOSING");
	}
}
*/
