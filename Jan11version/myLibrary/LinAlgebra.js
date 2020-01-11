
// ======== except where 3-dim notation is used, all other routines work for dim >= 2
// ===================================================================================

// rotate (global) vertices and (global) vVertices around the axes in R^3
const rotX = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        x,
        cd * y - sd  * z ,
        sd * y + cd  * z ] );
    if (truncationFlag) {
	vVertices = vVertices . map(([x,y,z]) => [
        x,
        cd * y - sd  * z ,
        sd * y + cd  * z ] );
    }
}
             );

// rotate vertices around Y axis in R^3
const rotY = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x - sd  * z ,
        y,
        sd * x + cd  * z ] );
    if (truncationFlag){
	vVertices = vVertices . map(([x,y,z]) => [
        cd * x - sd  * z ,
        y,
        sd * x + cd  * z ] );
    }
}
             );

// rotate vertices around Z axis in R^3
const rotZ = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x - sd  * y ,
        sd * x + cd  * y ,
        z] );
    if (truncationFlag){
	vVertices = vVertices . map(([x,y,z]) => [
        cd * x - sd  * y ,
        sd * x + cd  * y ,
        z] );
    }
}
             );
             
// ===== From here on dim >= 2 except crossproduct with applications ===============

// ===== the "1" at the end of the following names says: do not use for arrays ======
const dotProd1 = ((sing1, sing2) => {
							let dp = 0;
							for (let k=0; k < 3; k++)
							{	dp = dp + sing1[k] * sing2[k];
							}
					return dp;
	});
                
// ======== sina1 may be a single vector, sina2 is an array ===========
const dotProd = ((sina1, sina2) => {
							let dp = [];
							for (let j=0; j < sina2.length; j++)
							{	if (!(Array.isArray(sina1[0])))
							    {	dp[j] = dotProd1(sina1,sina2[j]);    }
								else
								{	dp[j] = dotProd1(sina1[j],sina2[j]); }
							 }
					return dp;
	});

const norm1 = ((sing) => {
              const n = Math.sqrt(dotProd1(sing,sing));
        return n;
	});
	
const norm = ((pts) => {
			let n   = [];
			for (let j=0; j < pts.length; j++)
				 n[j] = norm1(pts[j]);
        return n;
	});

const normalize = ((sing) => {   // use only for non-zero vectors
                  const n  = norm1(sing);
                  const unit = [];
                  if ( n > 0 ) {
                  	for (let k = 0; k < 3; k++) {
                  		unit[k] = sing[k]/n;   }}
			return unit;
	});

function negVec1(sing) {
			const nv = [];
            for (let k=0; k < sing.length; k++) {
            	nv[k] = - sing[k]; }
		return nv;				
	}
	
function negVec(pts) {
			const nvs = [];
            for (let j=0; j < pts.length; j++) {
            	nvs[j] = negVec1(pts[j]); }
		return nvs;				
	}


const vecSum1 = ((sing1, sing2) => {
			const sum = [];
            for (let k=0; k < sing1.length; k++) {
			sum[k] = sing1[k] + sing2[k];	 }
		return sum;
	});
	
// ======= pts1 can be a single vector; pts2 needs to be an array of vectors

function vecSum(pts1,pts2) {
    		const sum = [];
    		for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ sum[j] = vecSum1(pts1,pts2[j]);    }
				else
					{ sum[j] = vecSum1(pts1[j],pts2[j]); }
    		}
		return sum;
	}

function vecDif1(sing1, sing2) {
			const dif = [];
            for (let k=0; k < sing1.length; k++) {
			dif[k] = sing1[k] - sing2[k];	 }
		return dif;
	}
	
function vecDif(pts1,pts2)  {
			const dif = [];
			for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ dif[j] = vecDif1(pts1,pts2[j]); }
				else
					{ dif[j] = vecDif1(pts1[j],pts2[j]); }
    		}
		return dif;
	}

// --------------- several multiplications by scalars -------------------------------
function scalTimesVec1(as,sing) {  	// multiplies 1 number with 1 vector, any dim
			const stv = [];
			for (let k=0; k < sing.length; k++) {
				stv[k] = as * sing[k]; }
		return stv;					// outputs vector of the same dimension as input
	}
	
function scalesTimes1Vec(am,sing) {  // multiplies array of numbers with 1 vector
			const ssv = [];
			for (let j=0; j < am.length; j++) {
				ssv[j] = scalTimesVec1(am[j],sing); }
		return ssv;					// outputs array of vectors
	}
	
function scalTimesVec(aa,pts) {		// multiplies 1 or array of numbers with array of vectors
			let stv = [];
			for (let j=0; j < pts.length; j++) {
				if (!(Array.isArray(aa)) )
					{ stv[j] = scalTimesVec1(aa,pts[j]); }
				else
					{ stv[j] = scalTimesVec1(aa[j],pts[j]); }
			}
		return stv; 				// outputs array of vectors
	}
// ----------------------------------------------------------------------------------	

function linComb1(a1,a2,sing1,sing2) {
			const linc = [];
			for (let k=0; k < sing1.length; k++) {
				linc[k] = a1*sing1[k] + a2*sing2[k];
			}
		return linc;
	}
	
function linComb(a1,a2,pts1,pts2)  {
			const linCom = [];
			for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ linCom[j] = linComb1(a1,a2,pts1,pts2[j]); }
				else
					{ linCom[j] = linComb1(a1,a2,pts1[j],pts2[j]); }
    		}
		return linCom;
	}	

function linTripleComb1(a1,a2,a3,sing1,sing2,sing3) {
			const lintc = [];
			for (let k=0; k < sing1.length; k++) {
				lintc[k] = a1*sing1[k] + a2*sing2[k] + a3*sing3[k];
			}
		return lintc;
	}
	
function linTripleComb(a1,a2,a3,pts1,pts2,pts3)  {
			const linTCom = [];
			for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ linTCom[j] = linTripleComb1(a1,a2,a3,pts1,pts2[j],pts3[j]); }
				else
					{ linTCom[j] = linTripleComb1(a1,a2,a3,pts1[j],pts2[j],pts3[j]); }
    		}
		return linTCom;
	}

const distance1 = ((sing1,sing2) => {
              const difv = vecDif1(sing1,sing2);
              let result = norm1(difv);
		return result;
	});
	
function distance(pts1,pts2)  {
			const dist = [];
			for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ dist[j] = distance1(pts1,pts2[j]); }
				else
					{ dif[j] = distance1(pts1[j],pts2[j]); }
    		}
		return dist;
	}
	
function reflectNormalToVector(axisVec,pts) {
			const a    = scalTimesVec1( 2/dotProd1(axisVec,axisVec), dotProd(axisVec,pts));
			const refN = vecDif( scalesTimes1Vec(a,axisVec), pts);
			return refN;
	}
	
function reflectParallelToVector(axisVec,pts) {
			const a    = scalTimesVec1( -2/dotProd1(axisVec,axisVec), dotProd(axisVec,pts));
			const refP = vecSum( scalesTimes1Vec(a,axisVec), pts);
			return refP;
	}


// ========= 3dim notation, next one takes any dimension ===========
const getCentroid = ((pts)=>  pts . reduce (([a,b,c],[x,y,z]) => [a+x, b+y, c+z ]) .map ((x) => x / pts.length) );

function getArrayMidpoint(pts) { let mdp = [];
                             for (let k = 0; k < pts[0].length; k++)
                            {    mdp[k]=0;
                                 for (let i=0; i < pts.length; i++)
                                {	mdp[k] = mdp[k] + pts[i][k];
                            	}   mdp[k] = mdp[k]/pts.length;
                            }
                return mdp;
}

// ================ 3-dim because of the cross-product and its applications ===============
function crossProd1(sing1, sing2)  {
								const cp = [];
								cp[0] = sing1[1] * sing2[2] - sing1[2] * sing2[1];
								cp[1] = sing1[2] * sing2[0] - sing1[0] * sing2[2];
								cp[2] = sing1[0] * sing2[1] - sing1[1] * sing2[0];
					return cp;
	}
	
function crossProd(pts1,pts2) {
			const cpd = [];
			for (let j=0; j < pts2.length; j++) {
    			if (!(Array.isArray(pts1[0])))
					{ cpd[j] = crossProd1(pts1,pts2[j]);    }
				else
					{ cpd[j] = crossProd1(pts1[j],pts2[j]); }
    		}
		return cpd;
	}

function faceBasis(midp,fvert)  {
			let b1 = vecDif1(fvert,midp); b1 = normalize(b1);
			let b2 = crossProd1(midp,b1); b2 = normalize(b2);
			let bb = [b1,b2];
		return bb;
	}

function rotateInFace(ang,qpt,midp,fvert)  { // rotate qpt in face with normal midp
			const ca   = Math.cos(ang);
			const sa   = Math.sin(ang);
			const fbb  = faceBasis(midp,fvert);
			const vdif = vecDif1(qpt, midp);
			const a1   = dotProd1(vdif, fbb[0]);
			const a2   = dotProd1(vdif, fbb[1]);
			const b1   = a1*ca - a2*sa;
			const b2   = a1*sa + a2*ca;
		const result   = vecSum1( linComb1(b1,b2,fbb[0],fbb[1]), midp);
		return result;
	}

function normalOf3Pts(pt1,pt2,pt3)  {
			const df1    = vecDif1(pt2,pt1);
			const df2  	 = vecDif1(pt3,pt2);
			const result = crossProd1(df1,df2);
		return result;
	}
	
	

// ============== End of Linear Algebra ============================