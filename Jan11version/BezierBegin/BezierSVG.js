window.onload=function(){

const div = document.getElementById("svgArea");

const svgEl = document.getElementById("mySVG");

svgEl.setAttribute("width","1210");
svgEl.setAttribute("height","400");
svgEl.setAttribute("viewBox"," -10 -140 360 400");

const scale = 80;  // scaling factor	

const aPar = 1;
const bPar = 3/5;  // morph in [0.5, 1]
const cPar = 2;

function kappa(t) {
		return bPar*(cPar + cos(aPar*t));
}

const s0 = 0; const s1 = 32; const n = 64;
const ds = (s1 - s0)/n;
let c0 =[1,0.5]; let v0 = [1,0];
let curve = [];
curve = CurveByCurvature2D(s0,s1,n, kappa, c0,v0);

// console.log(curve[1][0]," ",curve[1][0][1], "curve = ", curve);

//P(t)  = (1−t)^3 P0 + 3(1−t)^2t P1 +3(1−t)t^2 P2 + t^3 P3
function myBezier(t) {
	return py*cube(1-t) + 3*(py+my)*sqr(1-t)*t + 3*(qy-ny)*(1-t)*sqr(t) + qy*cube(t);
	}


let px = 0;
let py = 0;
let mx = 0;
let my = 0;
let hx = 0;
let hy = 0;

let qx = 0;
let qy = 0;
let nx = 0;
let ny = 0;
let kx = 0;
let ky = 0;

//let path = []; // One does not need an array of paths, one long path is ok
let path = document.createElementNS( "http://www.w3.org/2000/svg", "path" );
let txt  = '';
    			
    path.setAttribute( 'stroke' , '#000000' );
  	path.setAttribute( 'stroke-width' , 1.0 );
  	path.setAttribute( 'fill' , 'none' );

	
for (let i=0; i<n-1; i++)
{	
	// left
	px = curve[i][0][0];
	py = curve[i][0][1];
	mx = curve[i][1][0]*ds/3;
	my = curve[i][1][1]*ds/3;
	hx = px + mx;
	hy = py + my;
	// right
	qx = curve[i+1][0][0];
	qy = curve[i+1][0][1];
	nx = curve[i+1][1][0]*ds/3;
	ny = curve[i+1][1][1]*ds/3;
	kx = qx - nx;
	ky = qy - ny;
	[px,py,mx,my,hx,hy,qx,qy,nx,ny,kx,ky] = scalTimesVec1(scale, [px,py,mx,my,hx,hy,qx,qy,nx,ny,kx,ky]);			
	// draw with tangents
	txt += 'M' +px + ' '+ py;
    txt += 'C' +hx + ' '+ hy;
    txt += ' ' +kx + ' '+ ky;
    txt += ' ' +qx + ' '+ qy;
}
	// console.log("txt = ",txt);
	path.setAttribute( "d" , txt );
	svgEl.appendChild(path);
div.appendChild(svgEl);

};