

//mouse buttons
function msd(e){buttons[e.button]=tick;}
function msu(e){buttons[e.button]=0;}

//mouse 
let buttons=[],mx=0,my=0;
function but(i){return buttons[i]?1:0;}
function butp(i){return buttons[i]==tick?1:0;}

//keyboard
/*
let keys=[],keys_tick=[]
let onkeyup,onkeydown; //poll key functions to overload
function key(i){return keys[i]?1:0;}
function keyp(i){return keys[i]==tick?1:0;}
//function key_down(i){return keys_tick[i]?keys_tick[i]:0;}

const default_keys=[27,8,9,13,32,37,38,39,40,16,17,18,87];//prevent default

const SHIFT = 16,	CTRL = 17,	ALT = 18,	SPACE = 32,	RETURN = 13, ESCAPE=27,
	LEFT = 37,	RIGHT = 39,	DOWN = 40,	UP = 38,
	KA = 65,	KD = 68,	KS = 83,	KW = 87, 
	KQ = 81,	KE = 69,	KR = 82,	KG = 71,    KH = 72,
	KJ = 74,	KL = 76,	KM = 77,	KK = 75,	KI = 73	,
	KU = 85,	KO = 79,	KP = 80, KC = 67,	KF = 70, 
	KZ = 90, KX = 88
	;

function kbd(e){
	if(default_keys.indexOf(e.keyCode)>-1)
		e.preventDefault();

	if( e.repeat )
		return;

	if(!keys[e.keyCode] && onkeydown)
		onkeydown( e.keyCode );
	keys[e.keyCode]=tick;
}
function kbu(e){
	if(default_keys.indexOf(e.keyCode)>-1)
		e.preventDefault();

	if(keys[e.keyCode] && onkeyup)
		onkeyup( e.keyCode );
	keys[e.keyCode]=0;
}
window.addEventListener('keydown', kbd, false);
window.addEventListener('keyup', kbu, false);

*/


function mousemove(e)
{ 
	mx = e.clientX - cv.offsetLeft;
	my = e.clientY - cv.offsetTop + window.pageYOffset ;
}

document.addEventListener("mousemove", mousemove, false);
document.addEventListener("mousedown", msd, false);
document.addEventListener("mouseup", msu, false);

