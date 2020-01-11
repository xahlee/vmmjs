const pi   = Math.PI;
const epsD = 1/1024/128;
const E    = Math.exp(1);



function round(x) {
	return Math.round(x);
	}
function floor(x) {
	return Math.floor(x);
	}
function ceil(x) {
	return Math.ceil(x);
	}
function max(x,y,z) {
	return Math.max(x,y,z);
	}
function min(x,y,z) {
	return Math.min(x,y,z);
	}

function sqr(x) {
	if (!Array.isArray(x))
		 { return x*x; }
	else {  // apply to column of numbers
			const sq = [];
			for( let i=0; i < x.length; i++)
			sq[i] = x[i]*x[i];
			return sq;
		 }
	}
function cube(x) {
	return x*x*x;
	}
function pow4(x) {
	return sqr(sqr(x));
	}
function pow5(x) {
	return sqr(sqr(x))*x;
	}
function pow6(x) {
	return sqr(cube(x));
	}
	

function abs(x) {
	return Mat.abs(x);
	}
function inv(x) {
	return 1/x;
	}
function sqrt(x) {
	return Math.sqrt(x);
	}

function exp(t) {
	return Math.exp(t);
	}
function log(t) {
	return Math.log(t);
	}
function cosh(t) {
	return (Math.exp(t)+ Math.exp(-t))/2;
	}
function sinh(t) {
	return (Math.exp(t)- Math.exp(-t))/2;
	}

function sin(t) {
	return Math.sin(t);
	}
function cos(t) {
	return Math.cos(t);
	}
function tan(t) {
	return Math.tan(t);
	}
function atan(t) {
	return Math.atan(t);
	}

function numDerive(x, function1) {
	return (function1(x+epsD) - function1(x-epsD))/(2*epsD);
	}

// First the 1-dim case:		
function RungeKutta1(tA, fA, mA, dt, ODEfct1) {
		const h  = dt/2;
		const f1 = fA + mA * h;
		const m1 = ODEfct1(tA + h, f1);
		const f2 = fA + m1 * h;
		const m2 = ODEfct1(tA + h, f2);
		const f3 = fA + m2 * dt;
		const m3 = ODEfct1(tA + dt, f3);
		const fB = fA + (mA+ 2*m1+ 2*m2+ m3)*h/3;
		const mB = ODEfct1(tA + dt, fB);
	return [tA+dt, fB, mB];				
	}
	
// Now fA, mA and ODEfct are column-arraysof the same length > 1	
function RungeKutta(tA, fA, mA, dt, ODEfct) {
		const h  = dt/2;
		const f1 = linComb1(1, h, fA, mA);
		const m1 = ODEfct(tA + h, f1);
		const f2 = linComb1(1, h, fA, m1);
		const m2 = ODEfct(tA + h, f2);
		const f3 = linComb1(1, dt, fA, m2);
		const m3 = ODEfct(tA + dt, f3);
		const n1 = linComb1(1,2, mA, m1);
		const n2 = linComb1(2,1, m2, m3);
		const fB = linComb1(1, h/3, fA, vecSum1(n1,n2));
		           // fA + (mA+ 2*m1+ 2*m2+ m3)*h/3;
		const mB = ODEfct(tA + dt, fB);
	return [tA+dt, fB, mB];
	}
	
function CurveByCurvature2D(s0,s1,n, kappa, c0,v0) {
		function FrenetODE(t, v) {
			const kap = kappa(t);
			return [v[1]*kap, -v[0]*kap];
		}
		let result = [];
		const ds = (s1 - s0)/n;
		let tA   = s0; let fA = v0; let fM = 0;
		let mA 	 = FrenetODE(tA, fA);
		let intSecant;   let intSimpson; let cA = c0;
		result[0] = [cA,fA];
		
		for (let i=0; i<n; i++)
		{	
			for (let j=0; j< 8; j++) {
				[tA, fA, mA]   =	RungeKutta(tA, fA, mA, ds/16, FrenetODE);
			}
			fM = fA;
			for (let j=0; j< 8; j++) {
				[tA, fA, mA]   =	RungeKutta(tA, fA, mA, ds/16, FrenetODE);
			}
			intSecant  = linComb1(0.5, 0.5, v0, fA);
			intSimpson = linComb1(2*ds/3, ds/3, fM, intSecant);
			v0 = fA;
			cA = vecSum1(cA,intSimpson);
			result[i+1] = [cA,fA];
		}
	return result;
	}
	
