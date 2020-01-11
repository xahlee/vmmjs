var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

function sqr(x) {
	return x*x;
	}
function cube(x) {
	return x*x*x;
	}
function pow4(x) {
	return sqr(x)*sqr(x);
	}
	
function myTestCurve(arg,aa) {
			const sc = 240;  // scaling factor
			const x = sc*arg;
			const y = sc*Math.sin(arg);
			const t = sc*Math.cos(arg);
	return [x,y,sc*aa/3,t*aa/3];
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

//P(t)  = (1−t)^3 P0 + 3(1−t)^2t P1 +3(1−t)t^2 P2 + t^3 P3
function myBezier(t) {
	return py*cube(1-t) + 3*(py+my)*sqr(1-t)*t + 3*(qy-ny)*(1-t)*sqr(t) + qy*cube(t);
	}
	
for (let i=0; i<3; i++)
{	// left
	px = myTestCurve(a1,d)[0];
	py = myTestCurve(a1,d)[1];
	mx = myTestCurve(a1,d)[2];
	my = myTestCurve(a1,d)[3];
	hx = px + mx;
	hy = py + my;
	// right
	qx = myTestCurve(a2,d)[0];
	qy = myTestCurve(a2,d)[1];
	nx = myTestCurve(a2,d)[2];
	ny = myTestCurve(a2,d)[3];
	kx = qx - nx;
	ky = qy - ny;			
	// draw
	ctx.beginPath();
	ctx.moveTo(hx, hy);
	ctx.lineTo(px, py);    		// initial tangent
	ctx.bezierCurveTo(hx, hy, kx, ky, qx, qy);
	ctx.lineTo(kx,ky);	// final tangent
	ctx.stroke();
	//check
	console.log("error = ",(myBezier(0.5) - myTestCurve((a1+a2)/2,d)[1])/240," theory: abs < ",pow4(d)/384 );
	// next interval
	a1 = a2;
	a2 = a1 + d;
}

