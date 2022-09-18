let	log = console.log,
	max = (a,b) => a>b ? a : b,
	min = (a,b) => a<b ? a : b,
	sqrt = Math.sqrt ;



let column = [], ncol = 0 ;
function getMinColumn(){
	let ymin = 9999999, r = 0 ; 
	for( let j=0; j<ncol; ++j )	{

		let e = document.getElementById("Column" + j.toString() );
		e.style.color = '#f0f';
		let er = e.getBoundingClientRect() ;
		//let er = column[j].getBoundingClientRect() ;
		if( er.bottom < ymin )
			r = e, ymin = er.bottom ; 
	}
	return r;
}


// let column_y=[0,0,0,0,0,0,0,0,0,0,]
// //because actually getting the height was too unreliable... let's just guess
// function guessMinColumn( O )
// {
// 	O.raw.search("<img");
// 	//scan for image or vid
// 	let j=1,best=0;
// 	for(; j<ncol ; ++j )
// 		if( column_y[j] < column_y[best] )
// 			best = j;
// 	//apx O height
// }

function e_asdf( O, str ) 
{
	if( O.more )
	{
		if( O.title )
			return '<a href="'+O.more+'">' + O.title + '</a>' + 
				str +
				'<div style="text-align:right;"><a href="'+O.more+'"><p>' +
				(O.more_str?O.more_str:'Click to see more') + 
				'</p></a></div>';
		else		
			return '<a href="'+O.more+'">'+	str + 
			'<div style="text-align:right;"><p>' +
			(O.more_str?O.more_str:'Click to see more') + 
			'</p></div></a>';
	}
	else
	{
		if( O.title )
			return O.title+str;
		return str;
	}
}
function createColumnite( objv, current, TO_next )//objv, current )
{
	if( undefined === TO_next ) 
		TO_next = 200 ;

	let O = objv[current] ; 
	let parent = column[current%ncol];//getMinColumn();//column[ current % ncol ] ; 
	let e = document.createElement("div");
	parent.appendChild( e) ; 


	e.className = O.more ? "columnite_clickable" : "columnite" ;

	if( O.raw ){
		e.innerHTML = e_asdf(O,O.raw);
		parent.appendChild( e) ; 
		if( current+1  < objv.length )
		{
			createColumnite(objv, current+1);
			//setTimeout( function(){ createColumnite(objv, current+1)}, TO_next );
		}
		return; 
	}
	
	let xhttp = new XMLHttpRequest();
	xhttp.responseType = 'text' ;
	xhttp.onreadystatechange = function() {	
		if(xhttp.readyState == 4 && xhttp.status == 200) {

			e.innerHTML = e_asdf(O, xhttp.responseText);
			
			if( current+1  < objv.length )
				//setTimeout( function(){ createColumnite(objv, current+1)}, TO_next );
				createColumnite(objv, current+1)
		}
	};
	
	let path = 'post/' + O.url ; 
	xhttp.open("GET", path, true);	
	xhttp.send();
}

function remove_all( e )//recursively remove
{
	while( e.firstChild ){
		remove_all( e.firstChild ) ;
		e.removeChild(e.firstChild);
	}
}


let ContentW = -1 ; 

let abs = (x) => ( x < 0 ? -x : x ) ;  
function layItOut( objv )
{ 
	{
		let m = document.getElementById("ABC");//body ;
		log( 'm.href = ', m.url );
	}


	let b = document.getElementById("Content");//body ;
	let W = b.offsetWidth, H = b.offsetHeight

	if( abs(W - ContentW) < 10 )
		return ; 

	ContentW = W;

	remove_all( b ) ; 
	
	//calc num column
	ncol = 0|(W/400)  ;
	ncol = min(8,max(1, ncol ) )
	column = []
	
	//create column elements
	const cw = 0|( W - (ncol+3)*8  )/ncol ;
	
	let x = 8;
	for( let i=0;i<ncol;++i)
	{
		let e = document.createElement("div");
		e.id = "Column" + i.toString();
		//e.id = o.title ;//'Box ' + (++box_sz).toString() ;
		e.style.position = 'absolute';
		e.style.left = x.toString() + 'px';
		e.style.width = cw.toString() + 'px';
		x+=cw+8 ; 
		column[i] = e ; 
		b.appendChild( e ); 
	}

	//begin fill columns 
	createColumnite( objv, 0, 500   ); 
}

function vid(u){return '<video width=100% autoplay muted loop> <source src="' + u + '" type="video/webm" ></video>';}

let content = [
	

	//{ raw: '<img src="../fps/stand_aim_run.gif" width=100% />' },
	//{ raw: '<img src="../img/things.gif" width=100% />' },
	//{ raw: '<img src="../img/clouds.gif" width=100% />' },
	//{ raw: '<img src="../img/rakdohl.gif" width=100% />' },
	//{ raw:  '<img src="img/gorgonzola.png" width=100% /><p>Vertex-based font made in Blender to be used in a 
	
	//{ raw:''}

]


// let now = () => window.performance.now()/1e3 ;
// let should_resize = false;
// let tr = 0.0;
// //the hell.. resize causes 
// window.addEventListener('resize',  
// 						function(event) 
// 						{
// 							tr = now();
// 							setTimeout( function (){
// 								let dur = now() - tr ;  ///have not been altered since last.... 
// 								if( dur > .25  )
// 									layItOut(content);
// 							}, 250 );
// 						});
//
// 	tr = now();
// 	setTimeout( function (){
// 		let dur = now() - tr ;  ///have not been altered since last.... 
// 		if( dur > .25  )
// 		{
// 			layItOut(content);
// 		}
// 	}, 250 );

// }, true);

//layItOut(content)


// function animate() {
	
// 	let t = window.performance.now()/1e3 ;
// 	let x = ContentW - 150 + 2*Math.sin( t ) ;
// 	let y = -16 + 3*Math.sin( t*3 ) ;	
// 	let e = document.getElementById("BottomSeal");
// 	let a = 4 * Math.cos( t );
// 	e.style.transform = "rotate(" + a.toString() + "deg)";
// 	e.style.left =  x.toString() + "px" ; 
// 	e.style.bottom =  y.toString() + "px" ; 

// 	requestAnimationFrame(animate);
// }

// requestAnimationFrame(animate);

