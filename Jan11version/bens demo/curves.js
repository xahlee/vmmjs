window.onload=function(){

const div = document.getElementById("svgArea");

const svgEl = document.getElementById("mySVG");

svgEl.setAttribute("width","1210");
svgEl.setAttribute("height","400");
svgEl.setAttribute("viewBox"," -10 -120 1200 220");

const sc = 180;  // scaling factor	
function myTestCurve(arg) {
			const x = arg;
			const y = sin(arg);
			const t = cos(arg);
	return scalTimesVec1(sc, [x,y,1,t]);
	}

//P(t)  = (1−t)^3 P0 + 3(1−t)^2t P1 +3(1−t)t^2 P2 + t^3 P3
function myBezier(t) {
	return py*cube(1-t) + 3*(py+my)*sqr(1-t)*t + 3*(qy-ny)*(1-t)*sqr(t) + qy*cube(t);
	}

const d = Math.PI/3;
let a1 = 0;
let a2 = a1 + d;

let px = 0;
let py = 0;
let mx = 0;
let my = 0;

let qx = 0;
let qy = 0;
let nx = 0;
let ny = 0;

//let path = []; // One does not need an array of paths, one long path is ok
let path = document.createElementNS( "http://www.w3.org/2000/svg", "path" );
let txt  = '';
    			
    path.setAttribute( 'stroke' , '#000000' );
  	path.setAttribute( 'stroke-width' , 1.0 );
  	path.setAttribute( 'fill' , 'none' );

	
for (let i=0; i<6; i++)
{	
//	path[i] = document.createElementNS( "http://www.w3.org/2000/svg", "path" );
	// left
	px = myTestCurve(a1)[0];
	py = myTestCurve(a1)[1];
	mx = myTestCurve(a1)[2]*d/3;
	my = myTestCurve(a1)[3]*d/3;
	hx = px + mx;
	hy = py + my;
	// right
	qx = myTestCurve(a2)[0];
	qy = myTestCurve(a2)[1];
	nx = myTestCurve(a2)[2]*d/3;
	ny = myTestCurve(a2)[3]*d/3;
	kx = qx - nx;
	ky = qy - ny;			
	// draw with tangents
	txt += 'M' +hx + ' '+ hy;
	txt += 'L' +px + ' '+ py;
    txt += 'C' +hx + ' '+ hy;
    txt += ' ' +kx + ' '+ ky;
    txt += ' ' +qx + ' '+ qy;
    txt += 'L' +kx + ' '+ ky;
    
//   	path[i].setAttribute( "d" , txt );
//   	path[i].setAttribute( 'stroke' , '#000000' );
//   	path[i].setAttribute( 'stroke-width' , 1.0 );
//   	path[i].setAttribute( 'fill' , 'none' );

//	svgEl.appendChild(path[i]);

	//numerical check
	console.log("error = ",( myBezier(0.5) - myTestCurve((a1+a2)/2,d)[1] )/sc," theory: abs < ",pow4(d)/384 );
	// next interval
	a1 = a2;
	a2 = a1 + d;
}
	path.setAttribute( "d" , txt );
	svgEl.appendChild(path);
div.appendChild(svgEl);

};
