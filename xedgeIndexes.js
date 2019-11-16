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
let numEdges = edgeIndexes();
console.log(faceIndexes[0].length);
console.log(edgeIndexes[numEdges-1][0],edgeIndexes[numEdges-1][1]);
console.log(numEdges);


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
let midpoint = faceMidpoint(0);
console.log(midpoint);

