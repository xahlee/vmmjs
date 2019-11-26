

// getCentroid(points) returns the centroid of list of points
const getCentroid = ((pts) => pts . reduce (([a,b,c],[x,y,z]) => [a+x, b+y, c+z ]) .map ((x) => x / pts.length) );

// addPoints adds two arrays of numbers
const addPoints = (([pt1,pt2]) => { let sumpt = [];
                                 for(i=0; i < pt1.length; i++) {
                                 sumpt[i] = pt1[i] + pt2[i];
                                 } 
    				return sumpt;
    });
    
// takes the negative of an array of numbers
const minusPts = ((pts) => { let npt = [];
                                 for(i=0; i < pt1.length; i++) {
                                 npt[i] = -pts[i];}
                    return npt;
	});

// dotProdPts takes the dot product of two arrays of points
const dotProdPts = (([pt1,pt2]) => { let prod = 0;
                                 for(i=0; i < pt1.length; i++) {
                                 prod = prod + (pt1[i] * pt2[i]);
                                 } 
    				return prod;
    });
    
// scaleX multiplies an array of numbers by the constant sc.   
const scaleX = ((sc,pts) => { let scPts = [];
                                 for(i=0; i < pt1.length; i++) {
                                 scPts[i] = sc * pts[i];
                                 } 
    				return scPts;
    });
    
// linCombPts gives the linear combination of two arrays of numbers
const linCombPts = ((a1,a2,pt1,pt2) => {let cpt = [];
                                 for(i=0; i < pt1.length; i++) {
                                 cpt[i] = a1*pt1[i] + a2*pt2[i];}
                    return cpt;
	});    
    
//
const rot180PtsAround = ((axis, pts) => { 
                   let rpt = [];
                   rpt = minusPts(pts);
                   let dp = 2*dotProd(axis,pts)/dotProd(axis,axis);
                   rpt = addPts(rpt, scaleX(dp, pts)); 
            return rpt;
    	
	});


// up to hear the routines should be general and for arrays of any length
// the following routines also use global variables from the calling js-file

// zProj([x,y,z]) parallel projects a 3d point into 2d, by just dropping z. return [x,y]
//viewLength is known from the main js-file
const zProj = (([x,y,z]) => {
   let result = [x,y];
   if (projType == persp) {
        const ratio = viewLength/(viewLength - z);
   		result = [ratio*x, ratio*y];
   }
return result; 
});



const rotY2 = ((deg,vtcs) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vtcs = vtcs . map ( ([x,y,z]) => [
        cd * x + sd  * z ,
        y,
        -sd * x + cd  * z ] );
}
             );
                          
// rotate global vertices around Y axis
const rotY = ((deg,vtcs) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x + sd  * z ,
        y,
        -sd * x + cd  * z ] );
}
             );  
/*
// rotate data around X axis
const rotX = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        x,
        cd * y - sd  * z ,
        sd * y + cd  * z ] );
}
             );           

// rotate data around Z axis
const rotZ = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x - sd  * y ,
        sd * x + cd  * y ,
        z] );
}
             );
 */