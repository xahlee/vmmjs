
const svgArea        = document.getElementById("svgArea");
const polyhedronMenu = document.getElementById("polyhedronMenu");
const truncateMenu   = document.getElementById("truncateMenu");
const checkboxRotate = document.getElementById('checkboxRotate');
let inputViewDist    = document.getElementById("viewdist");
let inputTruncParam  = document.getElementById("truncParam");

let inputPatchStyle  = document.getElementById("patchstyle");
let inputWireFrame   = document.getElementById("wireframe");
let inputBlack       = document.getElementById("black");
let inputWhite       = document.getElementById("white");
let inputOrtho       = document.getElementById("ortho");
let inputPersp       = document.getElementById("persp");   


const viewPortWidth = 600;
const viewPortHeight = 600;
const viewBoxWidth = 40;
let mybackground = "black";
let myforeground = "cyan";

// ========== create the svg element ====================================
const svgEl = document.createElementNS("http://www.w3.org/2000/svg","svg");
svgEl.setAttribute("width",viewPortWidth);
svgEl.setAttribute("height",viewPortHeight);
svgEl.setAttribute("viewBox",`-21 -20 ${viewBoxWidth} ${viewBoxWidth}`);
// insert svg element to page
svgArea.appendChild(svgEl);

// =========================== svg initialization up to here ===========

// =============================== global parameters ===================
// rotationKeyIncrement is the degree for each key press
const rotationKeyIncrement = 5;

// For basic drawing
const patch = "patch";
const wire  = "wire";
let renderstyle;
renderstyle = patch;
let renderVal  = "patchstyle";  // needed for "refresh"
const underl = 0;
const overl  = 1;
let drawLine = overl;

// For perspective drawing
let viewLength = 80;    // is a parameter, not a constant
let viewPoint  = [0,0,viewLength];
const ortho    = "ortho"; // orthogonal
const persp    = "persp"; // perspective
let projType   = persp;

// For changing the truncation parameter
let truncParam = 32; // max = 48
let vParam     = truncParam/96; // see function TruncParam()

// For Truncation
const regular  = "regular"; // no truncation
const vtrunc   = "vtrunc";  // vertex truncation
const etrunc   = "etrunc";  // edge truncation
const strunc   = "strunc";  // snub truncation
let truncationMode  = regular;
let truncationFlag  = (truncationMode == vtrunc)||(truncationMode == etrunc)||(truncationMode==strunc);
truncateMenu.value = truncationMode; // refresh ok

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
let numEdges;         // = edgeIndexes.length = numFaces * faceIndexes[0].length
let edgesFromVertex;  // = vertexStar.length  = numEdges / numVertices

// The truncated polyhedra also have the property, that the vector to a face-midpoint is orthogonal
// to that face. We do not truncate them further, therefore we only need their vertices and their
// faceIndexes (which is all the drawing program uses). They are computed in getVTrunc, getETrunc, getSTrunc
// using getEdgeIndexes and getVertexStars. For the snubTruncation the rotation parameter is adjusted, so
// that the cut-off triangles are isocele.
let vVertices    = [];
let vFaceIndexes = [];
let fChgColor    = [];
let vDone        = false;  // Do not recompute vVertices for rotations or switch to wireFrame.

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
    fChgColor[0] = numFaces;
    vDone = false;
    // use default values for the truncation that give Archimedean solids:
    if (truncationMode == vtrunc) {getVFaceIndexes(); truncParam = 32;}
    if (truncationMode == etrunc)
    {   getEFaceIndexes(); truncParam = 32;
    	if (polyhedronMenu.value == "tetrahedron")  {truncParam = 36}
    	if (polyhedronMenu.value == "cube")         {truncParam = 28}
    	if (polyhedronMenu.value == "dodecahedron") {truncParam = 24}
    }	
    if (truncationMode == strunc) {getSFaceIndexes(); truncParam = 48;}
    inputTruncParam.value = truncParam;
    vParam = truncParam/96;
// =========== These index computations are done only once for each polyhedron =====
// ======= vertices and vVertices are rotated; vVertices depend on vParam ==========
});


// =================== The routines for computing the index arrays =================
/* 
   The array faceIndexes[j] contains for the j.th face the array of the vertex-indices
   of its vertices. This information also contains the edges of that face.
   The edges are also numbered and in getEdgeIndexes() we use faceIndexes to number
   the edges; the array edgeIndexes[k] contains for the k.th oriented edge the indices 
   of its initial and end vertices, the face number of its face and the number of that
   edge as an edge in the face.
   We also need the opposite: given the endpoints of and edge we need to know its number.
   This is stored in the array edge2num. k = edge2num[j1][j2] gives the number of the
   edge with vertex-indices j1, j2. This is used to truncate the platonic polyhedra. It
   cannot be used for a second truncation.
  */
   
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
	     edge2num[i][j]   = -1; }}
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

// ====== getInverseEdge( number of edge[j1,j2]) = number of inverseEdge[j2,j1]  =======
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
/*
const checkTruncDetailsF = (() => {          // ======== helps debugging the following routine ==========
				console.log("The separate vFaceIndexes follow:");
				for (i = 0; i < numVertices; i++) {
				console.log(i,".th vFaceIndex ",vFaceIndexes[i][0],vFaceIndexes[i][1],vFaceIndexes[i][2]);}
});
*/
const getVFaceIndexes= (() =>
           {	
	 		vFaceIndexes = []; // 
			for (j = 0; j < numVertices + numFaces ; j++) {
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
			fChgColor[1] = numVertices;
				//console.log("First Part of getVFaceIndexes: ","edge2num=",edge2num);
				
			// the nearer vVertex on an edge has the same number as this edge
			const faceLength = faceIndexes[0].length;
			for (j = 0; j < numFaces; j++)
			 	{    let currentEdge = [];        //  console.log(j,"th face=",faceIndexes[j] );
			 	 	 let currentEdgeNum = -1;
			 	 	 let inverseEdgeNum = -1;
			 	for (ec = 0; ec < faceLength; ec++) 
			 		{  currentEdge = [ faceIndexes[j][ec], faceIndexes[j][(ec+1)%faceLength] ];
			 		   currentEdgeNum = edge2num[currentEdge[0]] [currentEdge[1]];
			 		   inverseEdgeNum = edge2num[currentEdge[1]] [currentEdge[0]];
			 		//console.log("currentEdge= ",currentEdge, currentEdgeNum,inverseEdgeNum);
			 			vFaceIndexes[numVertices + j][2*ec]     = edge2num[currentEdge[0]] [currentEdge[1]];
			 			vFaceIndexes[numVertices + j][(2*ec+1)] = edge2num[currentEdge[1]] [currentEdge[0]];			 			
			 	  	}
		
		//console.log("vFaceIndexes[numVertices + j][all]= ",vFaceIndexes[numVertices + j]);
				}
			fChgColor[2] = numVertices + numFaces ;
			//	console.log("vFaceIndexes=",vFaceIndexes);
		} );
	
	//checkTruncDetailsF();
	
const getEFaceIndexes= (() =>   // stored in vFaceIndexes
           {	vFaceIndexes = [];
                let ke     = -1;       // edgeNumber
                let nextV  = -1;       // vVertexNumber underneath a platonic vertex
                const auxV = numFaces + numVertices; // first two groups of faces
                const numFaceVert = faceIndexes[0].length;
                currentEdge  = []; 
                
			for (j = 0; j < numFaces + numVertices + numEdges/2; j++) { //
			    vFaceIndexes[j] = [];          }  // initialize as double array
											  
			for (j = 0; j < numFaces; j++)  // Faces inside old faces
				{
			    for (ec = 0; ec < numFaceVert; ec++)
						vFaceIndexes[j][ec] = j*numFaceVert + ec; // Faces inside the old Faces
			    }
			fChgColor[1] =  numFaces;
			   
			for (j = 0; j < numVertices; j++) // Faces underneath vertices
				{
			    for (ec = 0; ec < edgesFromVertex; ec++)
			    	{
			    		currentEdge = vertexStar[j][ec];  // ke = number of ec.th edge from vertex j
			    		//console.log("vertexStar[j][ec] ",vertexStar[j][ec],currentEdge,currentEdge[2],currentEdge[3]);
						nextV = currentEdge[2] * numFaceVert + currentEdge[3];
						vFaceIndexes[numFaces+j][ec] = nextV; 
					}
			    }			    
			 fChgColor[2] =  numFaces + numVertices;
			    
				ke = 0;
			   	for (j=0; j < numEdges; j++) 
				{
					currentEdge = edgeIndexes[j];
					//currentEdge[2] is the faceNum of this edge 
					if (currentEdge[0] < currentEdge[1])  // below we use both sides of the edge
					{
			    	  vFaceIndexes[auxV + ke][0] = currentEdge[2] * numFaceVert + currentEdge[3];
			    	  vFaceIndexes[auxV + ke][3] = currentEdge[2] * numFaceVert + (currentEdge[3]+1)%numFaceVert;
			    	  currentEdge = edgeIndexes[getInverseEdge(j)];
			    	  vFaceIndexes[auxV + ke][2] = currentEdge[2] * numFaceVert + currentEdge[3];
			    	  vFaceIndexes[auxV + ke][1] = currentEdge[2] * numFaceVert + (currentEdge[3]+1)%numFaceVert;
			    	  ke++;
			    	}
			    }
			 fChgColor[3] =  numFaces + numVertices + numEdges/2; 
			 	
		} );
			
const getSFaceIndexes= (() =>   // stored in vFaceIndexes. Almost the same as getEFaceIndexes
           {	vFaceIndexes = [];
                let ke     = -1;       // edgeNumber
                let nextV  = -1;       // vVertexNumber underneath a platonic vertex
                const auxV = numFaces + numVertices; // first two groups of faces
                const numFaceVert = faceIndexes[0].length;
                currentEdge  = []; 
                
			for (j = 0; j < numFaces + numVertices + numEdges; j++) { //
			    vFaceIndexes[j] = [];          }  // initialize as double array
											  
			for (j = 0; j < numFaces; j++)  // Faces inside old faces
				{
			    for (ec = 0; ec < numFaceVert; ec++)
						vFaceIndexes[j][ec] = j*numFaceVert + ec; // Faces inside the old Faces
			    }
			fChgColor[1] =  numFaces;
			    
			for (j = 0; j < numVertices; j++) // Faces underneath vertices
				{
			    for (ec = 0; ec < edgesFromVertex; ec++)
			    	{
			    		currentEdge = vertexStar[j][ec];  // ke = number of ec.th edge from vertex j
			    		//console.log("vertexStar[j][ec] ",vertexStar[j][ec],currentEdge,currentEdge[2],currentEdge[3]);
						nextV = currentEdge[2] * numFaceVert + currentEdge[3];
						vFaceIndexes[numFaces+j][ec] = nextV; 
					}
			    }			    
			 fChgColor[2] =  numFaces + numVertices;
			    
				ke = 0;
			   	for (j=0; j < numEdges; j++) 
				{
					currentEdge = edgeIndexes[j];
					//currentEdge[2] is the faceNum of this edge 
					{
			    	  vFaceIndexes[auxV + ke][0] = currentEdge[2] * numFaceVert + currentEdge[3];
			    	  vFaceIndexes[auxV + ke][2] = currentEdge[2] * numFaceVert + (currentEdge[3]+1)%numFaceVert;
			    	  currentEdge = edgeIndexes[getInverseEdge(j)];
			    	  vFaceIndexes[auxV + ke][1] = currentEdge[2] * numFaceVert + currentEdge[3];
			    	  ke++;
			    	}
			    }
			 fChgColor[3] =  numFaces + numVertices + numEdges;
				
		} );
  
// const getCentroid = ((pts) => pts . reduce (([a,b,c],[x,y,z]) => [a+x, b+y, c+z ]) .map ((x) => x / pts.length) );
// now in:  MyVectorLib.js:  getCentroid(facePoints) returns the centroid of the face

// ================== The parameter dependent vertices are computed here ===========

// =============== getFace(j) computes the 3D-faces. Recompute after rotations or parameter changes!! =========
  // getFace(j) returns the array of vertices (their numbers in cyclic order) of the j.th face
  // faceIndexes.length = numberOfFaces, faceIndexes[j].length = number of vertices of j.th face
  // faceIndexes[j] is the array of the numbers of the vertices of the j.th face in cyclic order
  // getFace(j,faceIndexes,vertices) sends faceIndexes[j] to the corresponding array of 3D-vertices
  //old: const getFace = ((j) => faceIndexes[j] . map ((x) => vertices[x]) );
const getFace = ((j,fInd,vert) => fInd[j] . map ((x) => vert[x]) );  // will be called for platonics and their truncations

/*
const checkTruncDetailsV = (() => {         // ======== helps debugging the following routine ==========
				console.log("The vertices ",vertices); console.log("The vVertices ", vVertices);
			    for (i = 0; i < numEdges; i++) {
			    console.log(i,".th vVertex ",vVertices[i]);}
});
 */
 
const getVTrunc = (() => {
			if ( !vDone )  // Do not recompute for rotations in render()
			{
				vVertices = [];
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
 			vDone = true;
 		}
		});
// =============================== vertex truncations finished ==================================			
 
const getETrunc = (() => {
			if ( !vDone )
			{
				vVertices = [];
				const numEVertices = numFaces * faceIndexes[0].length;
				for (k = 0; k < numEVertices; k++) {
                vVertices[k] =  [];        }  // initialize as 2D-array
                let jMidpoint = [];
                let curVertex = [];
                let vc        = 0;            // counting index  
                
                for (j=0; j < numFaces; j++)
                {	
                	jMidpoint = getFaceMidpoint(getFace(j,faceIndexes,vertices));
                	for (cf = 0; cf < faceIndexes[0].length; cf++)
                    {
                    	curVertex = vertices[faceIndexes[j][cf]]; // vertexNr cf in faceNr j
                    	for (k = 0; k < 3; k++)
                    	{
                    	vVertices[vc][k] = (1-2*vParam) * curVertex[k]  + 2*vParam * jMidpoint[k];
                    	}
                    	vc++;
                    }
                }
                vDone = true;
            }
		});
// =============================== edge truncations finished ==================================


const getSTrunc = (() => {  // the e-vertices have to be rotated in the original face
			if ( !vDone )
			{
				vVertices = [];
				const numEVertices = numFaces * faceIndexes[0].length;
				for (k = 0; k < numEVertices; k++) {
                vVertices[k] =  [];        }  // initialize as 2D-array
                let jMidpoint = [];
                let firstVert = [];
                let curVertex = [];
                let triang1   = [];
                auxV          = [];
                let vc        = 0; 	           // counting index
                    // Needed for the isocele triangles on the snub polyhedra
                	let ang       = 0;
                	let angn      = 0;
                	let angp      = vParam/4
                	let difTn     = 0;
                	let difTest   = 0;
                	let difTp     = 0;
                	let dt1       = 0;
                	let dt2       = 0;	
                
                triang1    = vFaceIndexes[numFaces + numVertices];
                // T: [ 0, 1, 3 ], C: [ 0, 1, 4 ], O: [ 0, 1, 11 ], D: [ 0, 1, 44 ], I: [ 0, 1, 3 ] 
                // console.log("first triangle: ", triang1);
// ========= The following corrects the vParam-range so that Archimedean solids appear =====
                const polyCor = (() => { let cor = 0;
                			if (polyhedronMenu.value == "tetrahedron")  {cor = 1.46}
                			if (polyhedronMenu.value == "cube")         {cor = 1.1248}
                			if (polyhedronMenu.value == "octahedron")   {cor = 1.327}
                			if (polyhedronMenu.value == "dodecahedron") {cor = 0.8872}
                			if (polyhedronMenu.value == "icosahedron")  {cor = 1.2722}
                	return cor;
                } );
             
            	vParam = Math.max(vParam, 1.0/1024);
            	let ev = 0; ang = 0; angp = 0;  angn = 0;
         	while  (ev < 5)  {  // Repeat computation with different angle
                jMidpoint = [];
                firstVert = [];
                curVertex = [];
                auxV          = [];
                let vc        = 0;
                vVertices = [];
				for (k = 0; k < numEVertices; k++) {
                vVertices[k] =  [];   }
                 
                for (j=0; j < numFaces; j++)
                {	
                	jMidpoint = getFaceMidpoint(getFace(j,faceIndexes,vertices));
                	firstVert = vertices[faceIndexes[j][0]];
                	faceB = faceBasis(jMidpoint, firstVert);
                	// console.log(["midpoint,firstVertex: ",jMidpoint,firstVert]); console.log("faceBasis= ", faceB);
                	for (cf = 0; cf < faceIndexes[0].length; cf++)
                    {
                    	curVertex = vertices[faceIndexes[j][cf]]; // vertexNr cf in faceNr j
                    	for (k = 0; k < 3; k++)
                    	{
                    	auxV[k] = (1-vParam * polyCor()) * curVertex[k]  + vParam * polyCor() * jMidpoint[k];
                    	}
                    	vVertices[vc] = rotateInFace(ang, auxV, jMidpoint, firstVert);
                    	vc++;  			 // const rotateInFace =((ang,qpt,midp,fvert)
                    }
                }// console.log("getSTrunc, vVertices: ",vVertices);

// ==================== Snub truncation finished, but dependent also on the rotation parameter ang ===================                
// ==================== adjust rotation angle ang with the help of the first triangle dependent on vParam ============

                dt1 = dist1(vVertices[triang1[0]],vVertices[triang1[1]]);
                dt2 = dist1(vVertices[triang1[0]],vVertices[triang1[2]]);  	
                difTest =  dt1 - dt2;
                difTest1 = dist1(vVertices[triang1[1]],vVertices[triang1[0]]) - dist1(vVertices[triang1[1]],vVertices[triang1[2]]);
                difTest2 = dist1(vVertices[triang1[2]],vVertices[triang1[1]]) - dist1(vVertices[triang1[0]],vVertices[triang1[2]]);
                console.log("ev=",ev,"distDiff= ",difTest, " 2,3  ",difTest1, difTest2 );
                if (ev == 0) 
                   {difTn = difTest;  // result of computation at ang = 0, is positive.
                    ang   = vParam/4;  
                    if (polyhedronMenu.value == "icosahedron") {ang = -vParam/4};
                    }
                if (ev == 1)
                	{
                		if (difTest > 0) { angn = ang; ang = 2*ang; difTn = difTest; }
                		else {
                				angp  = ang;
                				ang   = (Math.abs(dt2)*angn + Math.abs(dt1)*angp)/(Math.abs(dt2)+Math.abs(dt1));
                				difTp = difTest;
                			}
                	}    
                if (ev == 2)   // good initial values for ang are different in different ranges of vParam
                	{
                		if ((difTest > 0)&&(Math.abs(angn) > 0)) { angn = ang; ang = 2*ang; difTn = difTest; }
                		else 
                		{	if (difTest < 0)
                				{
                				angp  = ang;
                				difTp = difTest;
                				ang   = (Math.abs(difTp)*angn + Math.abs(difTn)*angp)/(Math.abs(difTn)+Math.abs(difTp));
                				}
                			else{
                				angn  = ang;
                				difTn = difTest;
                				ang   = (Math.abs(difTp)*angn + Math.abs(difTn)*angp)/(Math.abs(difTn)+Math.abs(difTp));
                				}
                		}
                	}    
                if (ev > 2)    // from now on we can improve ang by iteration, since difTest(angn) * difTest(angp) < 0
                		{	if (difTest < 0)
                				{
                				angp  = ang;
                				difTp = difTest;
                				ang   = (Math.abs(difTp)*angn + Math.abs(difTn)*angp)/(Math.abs(difTn)+Math.abs(difTp));
                				}
                			else{
                				angn  = ang;
                				difTn = difTest;
                				ang   = (Math.abs(difTp)*angn + Math.abs(difTn)*angp)/(Math.abs(difTn)+Math.abs(difTp));
                				}
                		}
                ev++; 
            	}
                vDone = true;  // this avoids recomputation under rotation
            }
		});

// ============= Instead of a Linear Algebra library we have all routines here =========
// =====================================================================================
// rotate vertices around X axis
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

// rotate vertices around Y axis
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
             
// rotate vertices around Z axis
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

// ===== the "1" at the end of the following names says: do not use for arrays ======            
const dotProd1 = ((sing1, sing2) => {  
							let dp = 0;
							for (k=0; k < sing1.length; k++)
							{	dp = dp + sing1[k] * sing2[k];
							}
					return dp;
	});
	
const norm1 = ((sing) => {
              let n = Math.sqrt(dotProd1(sing,sing));
        return n;
	});
	
const normalize = ((sing) => {   // use only for non-zero vectors
                  let n = norm1(sing);
                  let unit = [];
                  for (k = 0; k < 3; k++) {
                  	unit[k] = sing[k]/n;  }
			return unit;
	});
	
const vecSum1 = ((sing1, sing2) => {
			let sum = [];
            for (k=0; k < sing1.length; k++) {
			sum[k] = sing1[k] + sing2[k];	 }
		return sum;
	});
	
const vecDif1 = ((sing1, sing2) => {
			let dif = [];
            for (k=0; k < sing1.length; k++) {
			dif[k] = sing1[k] - sing2[k];	 }
		return dif;
	});
	
const dist1 = ((sing1,sing2) => { 
              const difv = vecDif1(sing1,sing2);
              let result = norm1(difv); 
		return result;
	});

function getFaceMidpoint(pts) { let mdp = [];
                             for (k = 0; k < pts[0].length; k++)
                            {    mdp[k]=0;
                                 for (i=0; i < pts.length; i++)
                                {	mdp[k] = mdp[k] + pts[i][k];
                            	}   mdp[k] = mdp[k]/pts.length;
                            }
                return mdp;
}

const crossProd1 = ((sing1, sing2) => {  
								let cp = [];
								cp[0] = sing1[1] * sing2[2] - sing1[2] * sing2[1];
								cp[1] = sing1[2] * sing2[0] - sing1[0] * sing2[2];
								cp[2] = sing1[0] * sing2[1] - sing1[1] * sing2[0];								
					return cp;
	});	  
	
const faceBasis = ((midp,fvert) => {
			let b1 = vecDif1(fvert,midp); b1 = normalize(b1);
			let b2 = crossProd1(midp,b1); b2 = normalize(b2);
			let bb = [b1,b2];
		return bb;
	});
	
const rotateInFace =((ang,qpt,midp,fvert) => { // rotate qpt in face with normal midp
			const ca   = Math.cos(ang);
			const sa   = Math.sin(ang);
			const fbb  = faceBasis(midp,fvert);
			let vdif   = vecDif1(qpt, midp);
			const a1   = dotProd1(vdif, fbb[0]);
			const a2   = dotProd1(vdif, fbb[1]);
			let result = [];
			const b1   = a1*ca - a2*sa;
			const b2   = a1*sa + a2*ca;
			for (k=0; k<3; k++) {
				result[k] = b1*fbb[0][k] + b2*fbb[1][k] + midp[k];
			}		
		return result;
	});
	
const normalOf3Pts = ((pt1,pt2,pt3) => {
			const df1  = vecDif1(pt2,pt1);
			const df2  = vecDif1(pt3,pt2);
			let result = [];
			result     = crossProd1(df1,df2);
		return result;
	});
	
// ============== End of Linear Algebra ============================
	
// ============== In the next routines the look of each face is decided ===========
// viewLength is changed in an input field and is used for all polyhedra
// const zProj  = (([x,y,z]) => {zProjL([x,y,z],viewLength) } ); does not work

function zProjS(pt)  { 
				let result = [];
                result = [pt[0], pt[1]];
                if (projType == persp) {
        			let ratio = viewLength/(viewLength - pt[2]);
   					result    = [ratio*pt[0], ratio*pt[1]];
   				}
   	return result; }
    
function zProj(pts) { let results = [];
                if ( !Array.isArray(pts[0]) ) { results = [zProjS(pt)]; } 
				else {
				results = zProj(pts); } 
	return results; }

const projectedFaceFct = ((j,faceInd,vert) => { let ff = []; let pf = [];
                    ff = getFace(j,faceInd,vert); 
                       // console.log("projectedFace ",j,faceInd[j],vert[j]);
                    for (i=0; i < ff.length; i++) {
                         pf[i] = zProjS(ff[i]);
                     } 
                return pf;
        });

// ====================== First the Platonics =========================
// createSvgFace(j) creates a svg polygon element and return it. j is an int
const createSvgFace = ((j,zCoord) => {
       // const projectedFace = getFace(j,faceIndexes,vertices). map( zProj );     
        const projectedFace = projectedFaceFct(j,faceIndexes,vertices);
        let poly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
        poly.setAttribute("points", projectedFace .toString());

  if (renderstyle == patch) {    
    if (zCoord >= 0)
     {if (mybackground == "black") 
           poly.setAttribute("style", `fill:rgb(95%,95%,5%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
      else
           poly.setAttribute("style", `fill:rgb(80%,80%,100%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
     }
  }  
  // ========================= now wireFrame =========================
  if (renderstyle == wire) {
     if (zCoord >= 0)
       {
        if (drawLine == overl)
          {
          poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/128).toString()}`);
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

// ====================== Second the Archimedean Polyhedra =========================

// createSvgFace(j) creates a svg polygon element and return it. j is a int
const createSvgTVFace = ((j,zCoord) => {
        const vProjectedFace = projectedFaceFct(j,vFaceIndexes,vVertices);
        let vpoly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
        vpoly.setAttribute("points", vProjectedFace .toString());
     // console.log("vFaceIndexes[",j,"]= ",vFaceIndexes[j],vFaceIndexes[j][2], vVertices[vFaceIndexes[j][2]]);

  if (renderstyle == patch) {    
    if (zCoord >= 0)
     {if (mybackground == "black"){
        	if (j < fChgColor[1]) {
              vpoly.setAttribute("style", `fill:rgb(20%,80%,20%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);}
            else { if (j < fChgColor[2]) {
              vpoly.setAttribute("style", `fill:rgb(80%,80%,0%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);}
            else
              vpoly.setAttribute("style", `fill:rgb(20%,70%,50%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
                 }
           }
      else {
        	if (j < fChgColor[1]) {
              vpoly.setAttribute("style", `fill:rgb(15%,35%,90%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);}
            else { if (j < fChgColor[2]) {
              vpoly.setAttribute("style", `fill:rgb(80%,80%,100%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);}
            else
              vpoly.setAttribute("style", `fill:rgb(70%,45%,100%);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
                 }
           }
     }
/*    else // lower part, for debugging only
			vpoly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`); */
   }  
	// ========================== now wireFrame ==============
  if (renderstyle == wire) {
     if (zCoord >= 0)
       {
        if (drawLine == overl)
          {
          vpoly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/128).toString()}`);
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
                if (projType == ortho) {vpt = [0,0,10]}
     return vpt;
}); 
/*
const viewVector = ((point) => { let vpt = [];
				vpt[0] = - point[0];
				vpt[1] = - point[1];
				vpt[2] = - point[2] + viewLength;
     return vpt;
}); */

const visible = ((j) => { let midpoint = [];
   midpt  = getFaceMidpoint(getFace(j,faceIndexes,vertices));
   let result = midpt[2];
   if (projType == persp) {
   		result = dotProd1(midpt, viewVector(midpt));
   }
   return result; 
});
  
const TVvisible = ((j) => { 
	let vMidpt  = [];
	let vNormal = [];
   	vMidpt  = getFaceMidpoint(getFace(j,vFaceIndexes,vVertices));
   	if ((truncationMode == vtrunc)||(truncationMode == etrunc)) 
   	{
   		result = dotProd1(vMidpt, viewVector(vMidpt));
   	} else
   	{
   	let v0  = getFace(j,vFaceIndexes,vVertices)[0];
   	let v1  = getFace(j,vFaceIndexes,vVertices)[1];
   	let v2  = getFace(j,vFaceIndexes,vVertices)[2];
   
   	vNormal = normalOf3Pts(v0,v1,v2); // all faces are correctly oriented
   	result = dotProd1(vNormal, viewVector(vMidpt));
   	}
   return result; 
});

// ============================== Now put on Screen ============================ 
// In render() the created svgEl are put to the screen; order matters
const render = () => {
    if (truncationMode == vtrunc) { getVTrunc(); }
    if (truncationMode == etrunc) { getETrunc(); }
    if (truncationMode == strunc) { getSTrunc(); }
     
    svgEl . innerHTML = "";
    let zCoord;
     
    if (renderstyle == patch) 
    {
	   if ( !truncationFlag )          {
	   for (j = 0; j < faceIndexes.length; j++) {
       		zCoord = visible(j);
       		if (zCoord >= 0) {svgEl.appendChild(createSvgFace(j,zCoord));} 
       }}
	if ( truncationFlag)                             {
	   		for (j = 0; j < vFaceIndexes.length; j++) {
       			zCoord = TVvisible(j);
       			if (zCoord >= 0) 
       			{svgEl.appendChild(createSvgTVFace(j,zCoord));}
       		}}
	}// end patch
	   
	 if (renderstyle == wire) 
	 { 
	   if ( !truncationFlag ) {
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
	    
	    if ( truncationMode == regular ) {
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
	    
	    if ( truncationFlag  )                    {
	    drawLine = underl;
	    for (j = 0; j < vFaceIndexes.length; j++) {
	          {
	            zCoord = TVvisible(j);
	            if (zCoord >= 0)
	               svgEl.appendChild(createSvgTVFace(j,zCoord));
	          }
	    	}
	    drawLine = overl;
	    for (j = 0; j < vFaceIndexes.length; j++) {
	          {
	            zCoord = TVvisible(j);
	            if (zCoord >= 0)
	               svgEl.appendChild(createSvgTVFace(j,zCoord));
	          }
	    	}
	    }
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

    if (key.code === "ArrowUp"    || (key.keyCode === 38)) { rotX(+rotationKeyIncrement)};
    if (key.code === "ArrowDown"  || (key.keyCode === 40)) { rotX(-rotationKeyIncrement)};
    if (key.code === "ArrowRight" || (key.keyCode === 39)) { rotY(-rotationKeyIncrement)};
    if (key.code === "ArrowLeft"  || (key.keyCode === 37)) { rotY(+rotationKeyIncrement)};
    key.code    = "";
    key.keyCode = 32;
});

const gettruncationMode = ((truncateName) => {
	if (truncateMenu.value == "regular") {truncationMode = regular};
	if (truncateMenu.value == "vtrunc")  {truncationMode = vtrunc; getVFaceIndexes();  truncParam = 32;}
	if (truncateMenu.value == "etrunc")  {truncationMode = etrunc; getEFaceIndexes();  truncParam = 32;}
	if (truncateMenu.value == "strunc")  {truncationMode = strunc; getSFaceIndexes();  truncParam = 48;}
	truncationFlag = (truncationMode == vtrunc)||(truncationMode == etrunc)||(truncationMode == strunc);
	 if (truncationMode == etrunc) {
    	if (polyhedronMenu.value == "tetrahedron")  {truncParam = 36}
    	if (polyhedronMenu.value == "cube")         {truncParam = 28}
    	if (polyhedronMenu.value == "dodecahedron") {truncParam = 24}
    } 
    inputTruncParam.value = truncParam;
    vParam = truncParam/96; 
	vDone = false;
});

inputViewDist.value = viewLength;
function ViewDist() {
viewLength = inputViewDist.value;
viewPoint  = [0,0,viewLength];
vDone = false;  // recomputation needed
render();
}

//inputTruncParam.value = truncParam;
function TruncParam() {
truncParam = inputTruncParam.value;
vParam     = truncParam/96;
vDone = false;
render();
}

let rotateTimerId;

const toggleAutoRotation = (() => {
    if ( checkboxRotate.checked ) {
        rotateTimerId = setInterval ((() => { rotY(3); ; render();}), 100); }
    else { clearInterval (rotateTimerId); render()}; });

const PatchWire = (() => {
	if (inputWireFrame.checked) {renderstyle = wire; inputPatchStyle.value = "";}
	if (inputPatchStyle.checked) {renderstyle = patch; inputWireFrame.value = "";}
	render();	
});
const BlackWhite = (() => {
	if (inputBlack.checked) 
		{mybackground = "black"; myforeground = "cyan"; inputWhite.checked = false;}
	if (inputWhite.checked) 
		{mybackground = "white"; myforeground = "black"; inputBlack.checked = false;}
	document.body.style.backgroundColor = mybackground;
    document.body.style.color = myforeground;
	render();	
});
const OrthoPersp = (() => {
	if (inputOrtho.checked) {projType = ortho; inputPersp.checked = false;}
	if (inputPersp.checked) {projType = persp; inputOrtho.checked = false;}
	render();	
});	
	inputBlack.checked = true;
    inputPatchStyle.checked = true;
    inputPersp.checked = true; 

const init = (() => {
    document.body.style.backgroundColor = mybackground;

    initVertices(polyhedronMenu.value);
    rotX(20);
    rotY(30);
    toggleAutoRotation();
});



init();



{
    // ================ setup events and handler ===========================

    // make arrow keys to rotate the object
    document . body. addEventListener("keydown", ((keyPressed) => { doKeyPress(keyPressed); render();}));

    // when user selects an object in menu, draw it
    polyhedronMenu. addEventListener("change", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur();}));
    // polyhedronMenu. addEventListener("input", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur(); }));

    truncateMenu. addEventListener("change", (() => {gettruncationMode(truncateMenu.value); render(); truncateMenu.blur()}));
    
    checkboxRotate.addEventListener ('change', toggleAutoRotation , false);
  
	inputOrtho.addEventListener("input", OrthoPersp);
	inputPersp.addEventListener("input", OrthoPersp);
	inputBlack.addEventListener("input", BlackWhite);
	inputWhite.addEventListener("input", BlackWhite);
	inputPatchStyle.addEventListener("input", PatchWire);
	inputWireFrame.addEventListener("input", PatchWire);
	
    inputViewDist . addEventListener("change", ViewDist);
    inputTruncParam.addEventListener("change", TruncParam);
}

//==================== vector functions are in MyVectorLib.js ==============================

