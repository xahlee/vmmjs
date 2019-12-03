
const svgArea = document.getElementById("svgArea");
const polyhedronMenu = document.getElementById("polyhedronMenu");
const checkboxRotate = document.getElementById('checkboxRotate');
const renderMenu = document.getElementById("renderMenu");
let inputViewDist = document.getElementById("viewdist");
const truncateMenu = document.getElementById("truncateMenu");
let inputTruncParam = document.getElementById("truncParam");

const viewPortWidth = 400;
const viewPortHeight = 400;
const viewBoxWidth = 40;
let mybackground = "black";

// ========== create the svg element ====================================
const svgEl = document.createElementNS("http://www.w3.org/2000/svg","svg");
svgEl.setAttribute("width",viewPortWidth);
svgEl.setAttribute("height",viewPortHeight);
svgEl.setAttribute("viewBox",`-20 -20 ${viewBoxWidth} ${viewBoxWidth}`);
// insert svg element to page
svgArea.appendChild(svgEl);

// =========================== svg initialization up to here ===========
// =============================== svg stuff up to here ================


// =============================== global parameters ===================
// rotationKeyIncrement is the degree for each key press
const rotationKeyIncrement = 5;

// For basic drawing
const patch = "patch";
const wire  = "wire";
let renderstyle;
renderstyle = patch;
const underl = 0;
const overl  = 1;
let drawLine = overl;

// For perspective drawing
let viewLength = 80;    // is a parameter, not a constant
let viewPoint  = (0,0,viewLength);
const ortho    = "ortho"; // orthogonal
const persp    = "persp"; // perspective
let projType   = persp;

// For changing the truncation parameter
let truncParam = 16; // max = 48
let vParam     = truncParam/96; // see function TruncParam()

// For Truncation
const regular  = "regular"; // no truncation
const vtrunc   = "vtrunc";  // vertex truncation
const etrunc   = "etrunc";  // edge truncation
const strunc   = "strunc";  // snub truncation
let truncationMode  = regular;
let truncationFlag  = (truncationMode == vtrunc)||(truncationMode == etrunc)||(truncationMode==strunc);




// ==== EXPLANATION of GLOBALS for PLATONIC polyhedra. The truncated polyhedra get other names.========
// number of vertices = vertices.length; vertices[i] = 3D-coordinates of the i.th vertex
let vertices    = [];
// number of faces = faceIndexes.length; faceIndexes[j] gives the vertices of j.th face in cyclic order
let faceIndexes = [];
// number of edges = edgeIndexes.length; edgeIndexes[k] gives edge, face of edge, index of edge in face
let edgeIndexes = [];
// edge2num[i,j] is -1 if i,j are not the vertices of an edge, otherwise the number of the edge
let edge2num    = [];
// vertex2edge[i] gives for each vertex i the number of an edge that starts at i
let vert2edge   = [];
// number of edges from a vertex = vertexStar.length; vertexStar[i] gives edges from i.th vertex in cyclic order
let vertexStar  = [];
let numVertices;      // = vertices.length
let numFaces;         // = faceIndexes.length
let numEdges;         // = edgeIndexes.length;
let edgesFromVertex;  // = vertexStar.length = numEdges/numVertices

// The truncated polyhedra also have the property, that the vector to a face-midpoint is orthogonal
// to that face. We do not truncate them further, therefore we only need their vertices and their
// faceIndexes (which is all the drawing program uses). They are computed in getVTrunc using
// getEdgeIndexes and gatVertexStars.
let vVertices    = [];
let vFaceIndexes = [];

// ================================= The platonic input data ============================
// ======================================================================================
// initVertices("cube") will fill the values of global variables vertices and faceIndexes.
// arguments must be string, one of "tetrahedron", "cube", etc
const initVertices = ((polyhedronName) => {
    const v = 10;
    const vo = 15;
    const gg = vo*(Math.sqrt(5)-1)/2;
    const hd = v*(Math.sqrt(5)+1)/2;
    const gd = v*(Math.sqrt(5)-1)/2;

    const polyData = {
        "tetrahedron": {
            "vertices": [
                [v,v,v],
                [-v,-v,v],
                [v,-v,-v],
                [-v,v,-v]
            ],
            "faces":[
                [0,1,2],
                [1,0,3],
                [2,3,0],
                [3,2,1]
            ]
        },
        "cube": {
            "vertices": [
                [ v, v, v],
                [-v, v, v],
                [-v,-v, v],
                [ v,-v, v],
                [ v, v,-v],
                [-v, v,-v],
                [-v,-v,-v],
                [ v,-v,-v]
            ],
            "faces":[
                [0,1,2,3],
                [1,0,4,5],
                [2,1,5,6],
                [3,2,6,7],
                [0,3,7,4],
                [7,6,5,4]
            ]
        },
        "octahedron": {
            "vertices":[
                [vo,0,0],
                [0,vo,0],
                [0,0,vo],
                [0,-vo,0],
                [0,0,-vo],
                [-vo,0,0]
            ],
            "faces":[
                [0,1,2],
                [0,2,3],
                [0,3,4],
                [0,4,1],
                [5,2,1],
                [5,3,2],
                [5,4,3],
                [5,1,4],
            ]
        },
        "icosahedron": {
            "vertices":[
                [ gg, 0, vo],
                [-gg, 0, vo],
                [ gg, 0,-vo],
                [-gg, 0,-vo],
                [ 0, vo, gg],
                [ 0, vo,-gg],
                [ 0,-vo, gg],
                [ 0,-vo,-gg],
                [ vo, gg, 0],
                [ vo,-gg, 0],
                [-vo, gg, 0],
                [-vo,-gg, 0]
            ],
            "faces":[
                [0,1,4],
                [1,0,6],
                [4,8,0],
                [9,6,0],
                [8,9,0],
                [4,5,8],
                [8,5,2],
                [11,1,6],
                [5,3,2],
                [7,2,3],
                [2,7,9],
                [11,7,3],
                [6,7,11],
                [7,6,9],
                [9,8,2],
                [5,4,10],
                [10,4,1],
                [11,10,1],
                [10,11,3],
                [5,10,3],
            ]
        },
        "dodecahedron": {
            "vertices": [
                [ v, v, v],
                [-v, v, v],
                [-v,-v, v],
                [ v,-v, v],
                [ v, v,-v],
                [-v, v,-v],
                [-v,-v,-v],
                [ v,-v,-v],
                [0, gd, hd],
                [0,-gd, hd],
                [0, gd,-hd],
                [0,-gd,-hd],
                [ hd, 0, gd],
                [ hd, 0,-gd],
                [-hd, 0, gd],
                [-hd, 0,-gd],
                [ gd, hd, 0],
                [-gd, hd, 0],
                [ gd,-hd, 0],
                [-gd,-hd, 0]
            ],
            "faces":[
                [0,8,9,3,12],
                [2,9,8,1,14],
                [7,11,10,4,13],
                [5,10,11,6,15],
                [7,13,12,3,18],
                [0,12,13,4,16],
                [5,15,14,1,17],
                [2,14,15,6,19],
                [0,16,17,1,8],
                [5,17,16,4,10],
                [2,19,18,3,9],
                [7,18,19,6,11],
            ]
        }
    };
// NOTE: The following names are used for the Platonics ONLY
    vertices    = polyData[polyhedronMenu.value].vertices;
    //  =========== All index-arrays only change with a new platonic ===============
    faceIndexes = polyData[polyhedronMenu.value].faces;

    numVertices = vertices.length;
    numFaces    = faceIndexes.length;
    // These are needed for the truncation. They are only recomputed when the platonic changes
    getEdgeIndexes();
    getVertexStars();
    getVFaceIndexes();  
// =========== These index computations are done only once for each polyhedron =====
// ======= vertices and vVertices are rotated; vVertices depend on vParam ==========
});


// =================== The routines for computing the index arrays =================
/* [
   getEdgeIndexes(faceIndexes) returns edge indexes based on faceIndexes and it also
   fills the array edge2num. This routine is only used for truncated polyhedra
   
   example
   getEdgeIndexes([[2,3,4,5], [6,7,8]])
   return
   [
   [ [ 2, 3 ], [ 3, 4 ], [ 4, 5 ], [ 5, 2 ] ],
   [ [ 6, 7 ], [ 7, 8 ], [ 8, 6 ] ]
   ]
   It now returns four components: [edge0, edge1, itsFace, indexInFace]
   ] */
   
const getEdgeIndexes= (() => {  
    // fills the arrays edgeIndexes, edge2num, vert2edge and prepares for vertexStar
	const vl = vertices.length;
	const fl = faceIndexes[0].length;  // all faces are considered equal in truncation
	// initialize:
	edge2num = []; vertex2edge = [];
	for (i = 0; i < vl; i++)  {
	    edge2num[i]   = [] ;
	    vert2edge[i]  = -1;
	    }
  	for (i = 0; i < vl; i++)  {
	    for(j = 0; j < vl; j++)  { 
	     edge2num[i][j]   = -1; }}// filling the array with -1 should be easier
	// edgeIndexes[k] ist the k.th edge = [vertexStart, vertexEnd, itsFace, indexInFace]
	// edge2num gives for each edge its number and for non-edge pairs gives -1
	// vert2edge[j]  gives for the j.th vertex the number of an edge starting at it
	let k = 0;
	for (j = 0; j < faceIndexes.length; j++) 
	{
		const f = faceIndexes[j];  
		// f is the set of indices of vertices of the j.th face in cyclic order
	    for (i = 0; i < fl; i++) {
	        // contains: 1st edgeVertex, 2nd edgeVertex, itsFace, indexInFace
	    	edgeIndexes[k] = [f[i],f[(i+1)%fl],j,i];
	    	edge2num [f[i]] [f[(i+1)%fl]] = k;  // 2-index array syntax: array[i] [j]
	    	vert2edge[f[i]] = k;        
	    	// for each vertex this assignment occurs several times, but not in cyclic order
	    	k++;
	    	}
	}
	numEdges = k;
});

// getInverseEdge from the number of an edge the number of its inverse edge is given
const getInverseEdge= ((k) => { let inEdge;
          inEdge = edgeIndexes[k];         // an array of four numbers
   return edge2num[inEdge[1]] [inEdge[0]]; // number of inverse edge; entries not filled here are -1
});

// getVertexStars fills the array vertexStar; it must be called after getEdgeIndexes
const getVertexStars= (() => { vertexStar = [];
      // vertexStar is a global variable, initialized as double array:
      for (i=0; i < vertices.length; i++) {vertexStar[i] = []; }
	
	const fl = faceIndexes[0].length;       // = number of vertices of the face
	edgesFromVertex = numEdges/numVertices; // Only used for platonics where all vertices are the same
    for (i = 0; i < numVertices; i++)  {
	   let ke = vert2edge[i];               // number of the last stored edge leaving i.th vertex
	   let ecount = 0;
	   while (ecount < edgesFromVertex) {
	   	vertexStar[i][ecount] = edgeIndexes[ke]; // next edge from vertex i; the stored edge at i = 0.
	   	let edge3 = edgeIndexes[ke];
	   	let edgeNum = ke - 1;                // the edges are numbered face by face in cyclic order
	   	if (edge3[3] == 0) {edgeNum = ke - 1 + fl} 
	   	// edgeNum is the number of the edge, which, in the face of edge ke, ends at vertex i
	   	ke = getInverseEdge(edgeNum); // the inverse of edge edgeNum is the next edge from vertex i
	   	ecount++;
	   }}
});

const checkTruncDetailsF = (() => {          // ======== helps debugging the following routine ==========
				console.log("The separate vFaceIndexes follow:");
				for (i = 0; i < numVertices; i++) {
				console.log(i,".th vFaceIndex ",vFaceIndexes[i][0],vFaceIndexes[i][1],vFaceIndexes[i][2]);}
});

const getVFaceIndexes= (() =>
           {	
	 			vFaceIndexes = []; // 
			for (j = 0; j < numVertices + numFaces ; j++) { // + numFaces
			    vFaceIndexes[j] = [];          }  // initialize as double array
											  
			for (j = 0; j < numVertices; j++) 
				{
			    for (ec = 0; ec < edgesFromVertex; ec++) 
			    	{
			        // vFaceIndexes[j][ec] is the ivVertex-Index of the ks.th vertex around the j.th vertex
			        // vertexStar[j][ec] is the 4-array of the ec.th edge leaving vertex j
			        // ke = edge2num[j] [vertexStar[j][ec]]; is the number of this edge
			        // the nearest vVertex on this edge has this same number ke - by construction
						vFaceIndexes[j][ec] = edge2num[j][vertexStar[j][ec][1]];
			         //console.log("j:",j,"vertexStar[j][ec] = ",vertexStar[j][ec]," vFaceIndexes[j][ec] = ",edge2num[j] [vertexStar[j][ec][1]]);
			        } //console.log("j:",j,"vertexStar[j] = ",vertexStar[j]);
			    }
			console.log("get here?");
				console.log("edge2num=",edge2num);
			// the nearer vVertex on an edge has the same number as this edge
			const faceLength = faceIndexes[0].length;
			for (j = 0; j < numFaces; j++)
			 	{    let currentEdge = [];          console.log(j,"th face=",faceIndexes[j] );
			 	 	 let currentEdgeNum = -1;
			 	 	 let inverseEdgeNum = -1;
			 	for (ec = 0; ec < faceLength; ec++) 
			 		{  currentEdge = [ faceIndexes[j][ec], faceIndexes[j][(ec+1)%faceLength] ];
			 		   currentEdgeNum = edge2num[currentEdge[0]] [currentEdge[1]];
			 		   inverseEdgeNum = edge2num[currentEdge[1]] [currentEdge[0]];
			 		console.log("currentEdge= ",currentEdge, currentEdgeNum,inverseEdgeNum);
			 			vFaceIndexes[numVertices + j][2*ec]     = edge2num[currentEdge[0]] [currentEdge[1]];
			 			vFaceIndexes[numVertices + j][(2*ec+1)] = edge2num[currentEdge[1]] [currentEdge[0]];			 			
			 	  	}
		
		//console.log("vFaceIndexes[numVertices + j][all]= ",vFaceIndexes[numVertices + j]);
				}
				console.log("vFaceIndexes=",vFaceIndexes);
			} );
	
	//checkTruncDetailsF();
  
// const getCentroid = ((pts) => pts . reduce (([a,b,c],[x,y,z]) => [a+x, b+y, c+z ]) .map ((x) => x / pts.length) );
// now in:  MyVectorLib.js:  getCentroid(facePoints) returns the centroid of the face

// ================== The parameter dependent vertices are computed here ===========

// =============== getFace(j) computes the 3D-faces. Recompute after rotations or parameter changes =========
  // getFace(j) returns the array of vertices (their numbers in cyclic order) of the j.th face
  // faceIndexes.length = numberOfFaces, faceIndexes[j].length = number of vertices of j.th face
  // faceIndexes[j] is the array of the numbers of the vertices of the j.th face in cyclic order
  // getFace(j,faceIndexes,vertices) sends faceIndexes[j] to the corresponding array of 3D-vertices
  //old: const getFace = ((j) => faceIndexes[j] . map ((x) => vertices[x]) );
const getFace = ((j,fInd,vert) => fInd[j] . map ((x) => vert[x]) );  // will be called for platonics and their truncations


const checkTruncDetailsV = (() => {         // ======== helps debugging the following routine ==========
				console.log("The vertices ",vertices); console.log("The vVertices ", vVertices);
			    for (i = 0; i < numEdges; i++) {
			    console.log(i,".th vVertex ",vVertices[i]);}
});
 
const getVTrunc = (() => {

		   let p0 = []; let p1 = [];
           for (k = 0; k < numEdges; k++) {
                vVertices[k] = [];        }  // initialize as 2D-array
                
           for (k = 0; k < numEdges; k++) {
            	p0 = vertices[edgeIndexes[k][0]];
            	p1 = vertices[edgeIndexes[k][1]];
            	//console.log("k= ",k," EdgeIndexes = ",edgeIndexes[k][0],edgeIndexes[k][1],"  p0, p1 ", p0,p1);
            	//This check is ok
            	let p2 = [];  // without this one gets all vVertices the same
            	for (l=0; l < 3; l++)  {
            							p2[l] = (1 - vParam) * p0[l] + vParam * p1[l];
            							}
            	vVertices[k] = p2;
            	                   //p2 = linCombPts(1 - vParam,vParam,p0,p1); Why does this not work ??
            	// on each oriented edge we have one vertex of the edge truncation
            	// vVertex[k] lies on the k.th edge
			}
	// checkTruncDetailsV();		//looks good	
 
		}
			);


// ============= I did not succeed with putting the rotations in a library ========
// rotate vertices around X axis
//const rotX = ((deg) => {rotX2(deg,vertices) }); does not work -- why??
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

// rotate data around Y axis
//const rotY = ((deg) => {rotY2(deg,vertices) }); did not work;
// The following is needed in toggleAutoRotation and eventListener
const rotY = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x + sd  * z ,
        y,
        -sd * x + cd  * z ] );
    if (truncationFlag){
	vVertices = vVertices . map(([x,y,z]) => [
        cd * x - sd  * z ,
        y,
        sd * x + cd  * z ] );
    }
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
    if (truncationFlag){
	vVertices = vVertices . map(([x,y,z]) => [
        cd * x - sd  * y ,
        sd * x + cd  * y ,
        z] );
    }
}
             );
             
const dotProdS = ((sing1, sing2) => {  
								let dp = 0;
								for (k=0; k < sing1.length; k++) {
								dp = dp + sing1[k] * sing2[k];
								}
					return dp;
	});
             
// ============== In these routines the look of each face is decided ===========
// viewLength is changed in an input field and is used for all polyhedra
// const zProj  = (([x,y,z]) => {zProjL([x,y,z],viewLength) } ); does not work

function zProjS(pt)  { let result = [];
                     result = [pt[0], pt[1]];
                if (projType == persp) {
        			const ratio = viewLength/(viewLength - pt[2]);
   					result = [ratio*pt[0], ratio*pt[1]];
   				} // console.log("point ',pt, "projFace= ",result);
   	return result; }
    
function zProj(pts) { let results = [];
                if ( !Array.isArray(pts[0]) ) {results = [zProjS(pt)];} 
				else {
				results = zProj(pts); } 
	return results; }

const projectedFaceFct = ((j,faceInd,vert) => { let ff = []; let pf = [];
                    ff = getFace(j,faceInd,vert); 
                        console.log("projectedFace ",j,faceInd[j],vert[j]);
                    for (i=0; i < ff.length; i++) {
                         pf[i] = zProjS(ff[i]);
                     } 
                return pf;
        });

// createSvgFace(j) creates a svg polygon element and return it. j is a int
const createSvgFace = ((j,zCoord) => {
       // const projectedFace = getFace(j,faceIndexes,vertices). map( zProj );     
        const projectedFace = projectedFaceFct(j,faceIndexes,vertices);
        let poly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
        poly.setAttribute("points", projectedFace .toString());

  if (renderstyle == patch) {    
    if (zCoord >= 0)
     {if (mybackground == "black") 
           poly.setAttribute("style", `fill:rgb(100%,100%,0%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
      else
           poly.setAttribute("style", `fill:rgb(5%,5%,5%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
     }
    else // lower part
    {
     poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
    }
  }  // now wireFrame
  if (renderstyle == wire) {
     if (zCoord >= 0)
       {
        if (drawLine == overl)
          {
          poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
          }
        if (drawLine == underl)
          {
          poly.setAttribute("style", `fill:none;stroke:rgb(0,0,0);stroke-linecap="butt";stroke-width:${(viewBoxWidth/64).toString()}`);
          }
     }
     if (zCoord < 0)
       if (drawLine == overl)
        {
         poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
        }
  }
    return poly;
});

// createSvgFace(j) creates a svg polygon element and return it. j is a int
const createSvgTVFace = ((j,zCoord) => {
        //const vProjectedFace = getFace(j,vFaceIndexes,vVertices). map( zProj ); does not work
        const vProjectedFace = projectedFaceFct(j,vFaceIndexes,vVertices);
        let vpoly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
        vpoly.setAttribute("points", vProjectedFace .toString());
        console.log("so farfar ok", j);
         console.log("vFaceIndexes[",j,"]= ",vFaceIndexes[j],vFaceIndexes[j][2], vVertices[vFaceIndexes[j][2]]);

  if (renderstyle == patch) {    
    if (zCoord >= 0)
     {if (mybackground == "black") 
           vpoly.setAttribute("style", `fill:rgb(100%,100%,0%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
      else
           vpoly.setAttribute("style", `fill:rgb(5%,5%,5%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
     }
    else // lower part
			vpoly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
   }  // now wireFrame
  if (renderstyle == wire) {
     if (zCoord >= 0)
       {
        if (drawLine == overl)
          {
          vpoly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
          }
        if (drawLine == underl)
          {
          vpoly.setAttribute("style", `fill:none;stroke:rgb(0,0,0);stroke-linecap="butt";stroke-width:${(viewBoxWidth/64).toString()}`);
          }
        }
     if (zCoord < 0)
       if (drawLine == overl)
        {
         vpoly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
        }
  }
    return vpoly;
});


// const setRotateState = ((key) => {
// let [x,y,z] = rotateState;
// // up arrow
// if (key.keyCode === 38) { x = (x + rotationKeyIncrement) % 360 };
// // down arrow
// if (key.keyCode === 40) { x = (x - rotationKeyIncrement) % 360 };
// // right arrow
// if (key.keyCode === 39) { z = (z + rotationKeyIncrement) % 360 };
// //if (key.Code === "ArrowRiht") { rotZ(10)};
// // left arrow
// if (key.keyCode === 37) { z = (z - rotationKeyIncrement) % 360 };
// rotateState = [x,y,z];
// console.log ( rotateState );
// });

// =========== The render routine decides what is added to the screen ============

// The viewVector to FaceMidpoints decides about visibility              
const viewVector = (([x,y,z]) => { let vpt = [-x, -y, viewLength -z];
     return vpt;
});


function getFaceMidpoint(pts) { let mdp = [];
                             for (k = 0; k < pts[0].length; k++) {
                                 mdp[k]=0;
                                 for (i=0; i < pts.length; i++)  {
                                	mdp[k] = mdp[k] + pts[i][k];
                            	}   mdp[k] = mdp[k]/pts.length;
                            }
                return mdp;
}

const visible = ((j) => { let midpoint = [];
   midpt  = getFaceMidpoint(getFace(j,faceIndexes,vertices));
   let result = midpt[2];
   if (projType == persp) {
   		result = dotProdS(midpt, viewVector(midpt));
   }
   return result; 
});
  
const TVvisible = ((j) => { let vMidpt = [];
   vMidpt  = getFaceMidpoint(getFace(j,vFaceIndexes,vVertices));
   let result = vMidpt[2];
   if (projType == persp) {
   		result = dotProdS(vMidpt, viewVector(vMidpt));
   }
   return result; 
});
 
// In render() the created svgEl are put to the screen; order matters
const render = () => {
    getVTrunc();
    svgEl . innerHTML = "";
    let zCoord;
     
    if (renderstyle == patch) 
    {
	   if ( truncationMode == regular)          {
	   for (j = 0; j < faceIndexes.length; j++) {
       		zCoord = visible(j);
       		if (zCoord >= 0) {svgEl.appendChild(createSvgFace(j,zCoord));} 
       }}
	if ( truncationFlag )                             {
	   		for (j = 0; j < vFaceIndexes.length; j++) {
       			zCoord = TVvisible(j);
       			if (zCoord >= 0) 
       			{svgEl.appendChild(createSvgTVFace(j,zCoord));}
       		}}
	}// end patch
	   
	 if (renderstyle == wire) 
	 { 
	   if ( truncationMode = regular) {
	   drawLine = overl;
	   for (j = 0; j < faceIndexes.length; j++) {
              zCoord = visible(j);
              if (zCoord < 0)
	            svgEl.appendChild(createSvgFace(j,zCoord)); 
	    }}
	    if ( truncationFlag )                     {
	    for (j = 0; j < vFaceIndexes.length; j++) {
	          {
	            zCoord = TVvisible(j);
	            if (zCoord < 0)
	               svgEl.appendChild(createSvgTVFace(j,zCoord));
	          }
	    }}
	    
	    if ( truncationMode = regular) {
	    drawLine = underl;  // Top parts here
	    for (j = 0; j < faceIndexes.length; j++) {
	          {
	            zCoord = visible(j);
	            if (zCoord >= 0)
	               svgEl.appendChild(createSvgFace(j,zCoord));
	          }
	    }
	   drawLine = overl;
	    for (j = 0; j < faceIndexes.length; j++) {
	          {
	            zCoord = visible(j);
	            if (zCoord >= 0)
	               svgEl.appendChild(createSvgFace(j,zCoord));
	          }
	    }}
	    
	    if ( truncationFlag )                     {
	    for (j = 0; j < vFaceIndexes.length; j++) {
	          {
	            zCoord = TVvisible(j);
	            if (zCoord >= 0)
	               svgEl.appendChild(createSvgTVFace(j,zCoord));
	          }
	    }}
	 } // end wire    
};

// ============= more debugging help, turned off in init() ========================
const checkComputedData = (() => {
	console.log(edgeIndexes);
	jl = 3;
	console.log(faceIndexes[0].length);
	console.log(numEdges);
	console.log(edgeIndexes[jl]);
	console.log(vert2edge);
	console.log([jl,edgeIndexes[vert2edge[jl]][0]]);
	console.log(edge2num[edgeIndexes[jl][0]][edgeIndexes[jl][1]]);
	let ki = edge2num[edgeIndexes[jl][1]][edgeIndexes[jl][0]];
	console.log(ki);
	console.log(edgeIndexes[ki][0],edgeIndexes[ki][1]);

	// check for each vertex its edges:
 	for (i=0; i < vertices.length; i++) {
    	for (j=0; j < edgesFromVertex; j++) {
			console.log(vertexStar[i][j]);
	}}

	let midpoint = getCentroid(getFace(0,faceIndexes,vertices));
	console.log(midpoint);
});

const checkTruncComputation = (() => {
    if (truncationFlag) {
	      console.log(vVertices.length)
		 	for (i=0; i < vertices.length; i++) {
		 	   for (j=0; j < edgesFromVertex; j++) {
				console.log(vFaceIndexes[i][j]);
		}}
	}
});

// ===================== response functions for input and init() ====================
const doKeyPress = ((key) => {

    if (key.code === "ArrowUp" || (key.keyCode === 38)) { rotX(+rotationKeyIncrement)};
    if (key.code === "ArrowDown" || (key.keyCode === 40)) { rotX(-rotationKeyIncrement)};
    if (key.code === "ArrowRight" || (key.keyCode === 39)) { rotY(rotationKeyIncrement)};
    if (key.code === "ArrowLeft" || (key.keyCode === 37)) { rotY(-rotationKeyIncrement)};

});

const getRenderStyle = ((renderName) => {
   let extra = 0;
   if (renderMenu.value == "patchstyle") {renderstyle = patch};
   if (renderMenu.value == "wireframe")  {renderstyle = wire};
   if (renderMenu.value == "ortho") {projType = ortho}; 
   if (renderMenu.value == "persp") {projType = persp};
   if (renderMenu.value == "black") {mybackground = "black"; extra = 1};
   if (renderMenu.value == "white") {mybackground = "white"; extra = 1};
   if (extra == 1) {
      document.body.style.backgroundColor = mybackground;}
   console.log(renderstyle, projType, mybackground, viewLength);
});

const gettruncationMode = ((truncateName) => {
	if (truncateMenu.value == "regular") {truncationMode = regular};
	if (truncateMenu.value == "vtrunc")  {truncationMode = vtrunc};
	if (truncateMenu.value == "etrunc")  {truncationMode = etrunc};
	if (truncateMenu.value == "strunc")  {truncationMode = strunc};
	if (truncateMenu.value != "regular") {truncationFlag = true};
	//console.log(truncationMode, truncParam);
});

inputViewDist.value = viewLength;
function ViewDist() {
viewLength = inputViewDist.value;
viewPoint  = (0,0,viewLength);
render();
}

inputTruncParam.value = truncParam;
function TruncParam() {
truncParam = inputTruncParam.value;
vParam     = truncParam/96;
render();
}

let rotateTimerId;

const toggleAutoRotation = (() => {
    if ( checkboxRotate.checked ) {
        rotateTimerId = setInterval ((() => { rotY(3); ; render();}), 100); }
    else { clearInterval (rotateTimerId); render()}; });

const init = (() => {
    document.body.style.backgroundColor = mybackground;
    initVertices(polyhedronMenu.value);
    getVTrunc();
    //rotX(10);
    //rotY(10);
    toggleAutoRotation();
    //checkComputedData();
    //checkTruncComputation();
});



init();



{
    // ================ setup events and handler ===========================

    // make arrow keys to rotate the object
    document . body. addEventListener("keydown", ((keyPressed) => { doKeyPress(keyPressed); render(); }));

    // when user select a object in menu, draw it
    polyhedronMenu. addEventListener("change", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur();}));
    // polyhedronMenu. addEventListener("input", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur(); }));

    renderMenu. addEventListener("change", (() => {getRenderStyle(renderMenu.value); render();renderMenu.blur()}));
    truncateMenu. addEventListener("change", (() => {gettruncationMode(truncateMenu.value); render(); truncateMenu.blur()}));
    
    checkboxRotate.addEventListener ('change', toggleAutoRotation , false);

    inputViewDist . addEventListener("change", ViewDist);
    inputTruncParam.addEventListener("change", TruncParam);inputTruncParam.blur();
}

//==================== vector functions are in MyVectorLib.js ==============================

