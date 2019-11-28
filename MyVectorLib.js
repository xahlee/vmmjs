
// ** These routines are written for arrays of points. **
// When used for single points the input needs to be in brackets: addPts([onePoint],[anotherPoint])

// getCentroid(points) returns the centroid of list of points
const getCentroid = ((pts) => pts . reduce (([a,b,c],[u,v,w]) => [a+u, b+v, c+w ]) .map ((x) => x / pts.length) );

// addPoints adds two arrays of numbers
const addPtsS = ((p1,p2) => { let sum = [];
                            for (k = 0; k<p1.length; k++)  {
                            sum[k] = p1[k] + p2[k];}
                    return sum;
    });

//addPoints adds two sets of arrays of numbers
const addPts = ((pt1,pt2) => {
								let sumpt = [];
								if (!Array.isArray(pt1[0]) ) {
								    sumpt = addPtsS(pt1,pt2);
								     }
								else{
								for(i=0; i < pt1.length; i++)   {sumpt[i] = []}
                                for(i=0; i < pt1.length; i++)    {
                             	sumpt[i] = addPtsS(pt1[i], pt2[i]);
                                } }
    				return sumpt;
    });
    
// takes the negative of an array of numbers
const minusPtsS = ((pts) => {   let np = [];
								for(k=0; k < pts.length; k++) {
                             		np[k] = - pts[k];
                             	}
                    return np;
    });

// allows a point or an array of points as input							
const minusPts = ((pts) => { 
								let npt = [];
								if (!Array.isArray(pts[0]) )  {
								for(k=0; k < pts.length; k++) {
                             		npt[k] = - pts[k];
                                } }
								else {
								const l = pts.length;
								for(i=0; i < l; i++)   {npt[i] = []}
                                for(i=0; i < l; i++)   {
                             		npt[i] = minusPtsS(pts[i]);
                                } }
    				return npt;
    });
    
// scaleC multiplies an array of numbers by the CONSTANT sc.
const scaleS = ((sc,pts) => { let scpt = [];
                              for(k=0; k < pts.length; k++) {
                             		scpt[k] = sc * pts[k];
                                }
					return scpt;
	});  
// scaleC multiplies aset of arrays of numbers by the CONSTANT sc. 
const scaleC = ((sc,pts) => { let scpts = []; 
							  if (!Array.isArray(pts[0]) )  {
								scpts = scaleS(sc,pts);
							  }
							  else
							  { const lp =  pts.length;
								for(i=0; i < lp; i++)   {scpts[i] = [];}
                                for(i=0; i < lp; i++)    {
                             		scpts[i] = scaleS(sc,pts[i]);
                                } } 
    				return scpts;
    });
 
// scaleX multiplies a set of arrays of points each with a different constant  
const scaleX = ((scv,pts) => { let scpts = [];  
								const lp =  pts.length;
								for(i=0; i < lp; i++)    {scpts[i] = []}
                                for(i=0; i < lp; i++)    {
                             		scpts[i] = scaleS(scv[i], pts[i]);
                                }
                                //console.log("scaleX ",scpts, lp, scv.length); 
    				return scpts;
    });
    

// linCombPts gives the linear combination of two arrays of numbers
// Format: pt1[i] = coordinate vector [x1, x2, x3] -- also other than dim = 3
const linCombPts = ((a1,a2,pt1,pt2) => { let cpt = [];
                                 for(i=0; i < pt1.length; i++)   {cpt[i] = []}
                                 for(i=0; i < pt1.length; i++)       {
                                 	for(k=0; k < pt1[0].length; k++) {
                                 	cpt[i][k] = a1*pt1[i][k] + a2*pt2[i][k]
                                 }}
                    return cpt;
	});
	
// example: dotProdS([1,2,3], [4, -5, 1]) NOT arrays of points. Dimension <> 3 is allowed
const dotProdS = ((sing1, sing2) => {  
								let dp = 0;
								for (k=0; k < sing1.length; k++) {
								dp = dp + sing1[k] * sing2[k];
								}
					return dp;
	});

// example: dotProd([1,2,3], array of points)  output.length = pt2.length
const dotProdC = ((singPt,pt2) => { 
								let dt = []; 
								if (!Array.isArray(pt2[0]) )  {
								let dt = [dotProdS(singPt, pt2)];
								}
								else
								{
                                //console.log("length= ",pt2.length, "singPt=", singPt, pt2);
								for(i=0; i < pt2.length; i++)        {
                                 	dt[i] = dotProdS(singPt, pt2[i]);
                                 }}
					return dt;
	});
// both arrays of points have to have the same length	
const dotProdX = ((pt1,pt2) => { 
								if (!Array.isArray(pt2[0]) )  {
								let dt = dotProdS(pt1, pt2);
								}
								else
								{let dt = [];
								for(i=0; i < pt2.length; i++)        {
                                 	dt[i] = dotProdS(pt1[i], pt2[i]);
                                 }}
					return dt;
	}); 
    

const rot180PtsAround = ((axis, pts) => { 
				   	let lp = pts.length; 
				   	let lv = axis.length;
                   	let rpt = []; 
                   	for(i=0; i < lp; i++)   {rpt[i] = [];} // initialized
                   	rpt = minusPts(pts);
                   	let nax = 0;
                   	for(k=0; k < lv; k++)   {nax = nax + axis[k]*axis[k]}
                   	let dp  = scaleC(2/nax, dotProdC(axis,pts));
                   	//console.log("axis= ",axis," pts= ",pts,"inside ", dp);                
                   	for(i=0; i < lp; i++) {
                       for(k=0; k < lv; k++) {
                       rpt[i][k] = rpt[i][k] + dp[i]*axis[k];
                   }}
           // console.log("rpt= ", rpt);
            return rpt;
	});


// up to hear the routines should be general and for arrays of any length

// ----------  Below NOT finished ------------------------------------------


const rotY2 = ((deg,vtcs) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vtcs = vtcs . map ( ([x,y,z]) => [
        cd * x + sd  * z ,
        y,
        -sd * x + cd  * z ] );
}
             );
                          
 

// rotate data around X axis
const rotX2 = ((deg,vtcs) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vtcs = vtcs . map ( ([x,y,z]) => [
        x,
        cd * y - sd  * z ,
        sd * y + cd  * z ] );
}
             );           

// rotate data around Z axis
const rotZ2 = ((deg,vtcs) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vtcs = vtcs . map ( ([x,y,z]) => [
        cd * x - sd  * y ,
        sd * x + cd  * y ,
        z] );
}
             );
