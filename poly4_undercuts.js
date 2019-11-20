const svgArea = document.getElementById("svgArea");
const polyhedronMenu = document.getElementById("polyhedronMenu");
const checkboxRotate = document.getElementById('checkboxRotate');

const viewPortWidth = 400;
const viewPortHeight = 400;
const viewBoxWidth = 40;

let midpt;
const patch = 0;
const wire  = 1;
let renderstyle;
renderstyle = wire;
underl = 0;
overl  = 1;
let drawLine;

// create the svg element
const svgEl = document.createElementNS("http://www.w3.org/2000/svg","svg");
svgEl.setAttribute("width",viewPortWidth);
svgEl.setAttribute("height",viewPortHeight);
svgEl.setAttribute("viewBox",`-20 -20 ${viewBoxWidth} ${viewBoxWidth}`);

// insert svg element to page
svgArea.appendChild(svgEl);

// rotationKeyIncrement is the degree for each key press
const rotationKeyIncrement = 5;

// a nested array of 3d coordinates.
let vertices;

// array, each element represent a face of polyhedron. It's index of the vertices
let faceIndexes;

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

vertices= polyData[polyhedronMenu.value].vertices;
faceIndexes= polyData[polyhedronMenu.value].faces;
});

const edgeIndexes= (() => {
        let k = 0;
        for (j = 0; j < faceIndexes.length; j++)
        {
                const f = faceIndexes[j];
            const l = f.length;
            for (i = 0; i< l-1; i++) {
                edgeIndexes[k] = [f[i],f[i+1]];
                k++;
                }
                edgeIndexes[k] = [f[l-1],f[0]];
                k++;
        }
        return(k);
});

function faceMidpoint(j) {
     let m = [0,0,0];
     let f = faceIndexes[j];
     let l = faceIndexes[j].length;
     for (i = 0; i< l; i++)
     {
       m[0] = m[0]+ vertices[f[i]][0];
       m[1] = m[1]+ vertices[f[i]][1];
       m[2] = m[2]+ vertices[f[i]][2];
     }
     m[0] = m[0]/l; m[1] = m[1]/l; m[2] = m[2]/l;
     return(m);
};


// getFace(j) return a array, each element is coordinate of a vertex of the face number j
const getFace = ((j) => faceIndexes[j] . map ((x) => vertices[x]) );

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

// rotate data around Y axis
const rotY = ((deg) => {
    const cd = Math.cos(Math.PI/180 * deg);
    const sd = Math.sin(Math.PI/180 * deg);
    vertices = vertices . map ( ([x,y,z]) => [
        cd * x - sd  * z ,
        y,
        sd * x + cd  * z ] );
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

const scaleX = ((sc) => {
    vertices = vertices . map ( ([x,y,z]) => [
        sc * x,
        sc * y,
        sd * z ] );
}
               );

// zProj([x,y,z]) parallel projects a 3d point into 2d, by just dropping z. return [x,y]
const zProj = (([x,y,z]) => [x,y]);

// createSvgFace(j) creates a svg polygon element and return it. j is a int


const createSvgFace = ((j) => {
    midpt = faceMidpoint(j);

     const projectedFace = getFace(j). map( zProj );
     let poly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
     poly.setAttribute("points", projectedFace .toString());

  if (renderstyle == patch) {   
    if (midpt[2] >= 0)
    {
     //poly.setAttribute("style", `fill:rgb(100%, 75%, 79%, 0.5);stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
     poly.setAttribute("style", `fill:yellow;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
    }
    else
    {
     poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
    }
  }
  if (renderstyle == wire) {
     if (midpt[2] >= 0)
       {
        if (drawLine == overl)
          {
          poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);
          }
        if (drawLine == underl)
          {
          poly.setAttribute("style", `fill:none;stroke:white;stroke-width:${(viewBoxWidth/64).toString()}`);
          }
       }
     if (midpt[2] <= 0)
       if (drawLine == overl)
        {poly.setAttribute("style", `fill:none;stroke:red;stroke-width:${(viewBoxWidth/256).toString()}`);}
  }
    return poly;
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

const doKeyPress = ((key) => {

    if (key.code === "ArrowUp" || (key.keyCode === 38)) { rotX(rotationKeyIncrement)};
    if (key.code === "ArrowDown" || (key.keyCode === 40)) { rotX(-rotationKeyIncrement)};
    if (key.code === "ArrowRight" || (key.keyCode === 39)) { rotY(rotationKeyIncrement)};
    if (key.code === "ArrowLeft" || (key.keyCode === 37)) { rotY(-rotationKeyIncrement)};

});

const render = () => {
    svgEl . innerHTML = "";
    if (renderstyle == patch)
       {
           for (j = 0; j < faceIndexes.length; j++) {
              midpt = faceMidpoint(j);
              if (midpt[2] >= 0)
                  svgEl.appendChild(createSvgFace(j));
                 }
            }
         if (renderstyle == wire)
         {
           drawLine = overl;
           for (j = 0; j < faceIndexes.length; j++) {
              midpt = faceMidpoint(j);
              if (midpt[2] <= 0)
                    svgEl.appendChild(createSvgFace(j));
            }
            drawLine = underl;
            for (j = 0; j < faceIndexes.length; j++) {
                  {
                    midpt = faceMidpoint(j);
                    if (midpt[2] >= 0)
                       svgEl.appendChild(createSvgFace(j));
                  }
            }
           drawLine = overl;
            for (j = 0; j < faceIndexes.length; j++) {
                  {
                    midpt = faceMidpoint(j);
                    if (midpt[2] >= 0)
                       svgEl.appendChild(createSvgFace(j));
                  }
            }
          }       
};

let rotateTimerId;

const toggleAutoRotation = (() => {
        if ( checkboxRotate.checked ) {
            rotateTimerId = setInterval ((() => { rotY(3) ; render();}), 100); }
        else { clearInterval (rotateTimerId); render()} });

const init = (() => {
    initVertices(polyhedronMenu.value);
    rotX(10);
    rotY(10);
    toggleAutoRotation();
});

init();


let numEdges = edgeIndexes();
console.log(faceIndexes[0].length);
console.log(edgeIndexes[numEdges-1][0],edgeIndexes[numEdges-1][1]);
console.log(numEdges);


let midpoint = faceMidpoint(0);
console.log(midpoint);


{
    // setup events and handler

    // make arrow keys to rotate the object
    document . body. addEventListener("keydown", ((keyPressed) => { doKeyPress(keyPressed); render(); }));

    // when user select a object in menu, draw it
    polyhedronMenu. addEventListener("change", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur();}));
    polyhedronMenu. addEventListener("input", (() => {initVertices(polyhedronMenu.value); rotY(20); rotX(10); render(); polyhedronMenu.blur(); }));

    checkboxRotate.addEventListener ('input', toggleAutoRotation , false);

}
