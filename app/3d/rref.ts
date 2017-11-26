import { splitEvery, map, sum, filter, compose, all, equals, identity, clone, flatten } from "ramda";
import { Matrix3 } from "three";

type Matrix_float64 = Float64Array;

export let permute = (m:Matrix_float64, i0:number, i1:number) => {
    let temp = 0;
    for(let i=0; i<m[1]; i++){
        temp=m[m[1]*i0 + i + 2];
        m[m[1]*i0 + i + 2]=m[m[1]*i1 + i + 2];
        m[m[1]*i1 + i + 2]=temp;
    }     
    return m;         
};  

let elimination = (A) => {
    let pivot=0;  
    for(let i=0; i<A[0]; i++){
        pivot=A[i*A[0]+i+2];  

        if(pivot===0){
           let ctr=0; 
 
           while( (Math.abs(A[(i+ctr)*A[0]+i+2]) <= 1e-15) && A[(i+ctr)*A[0]+i+2]!=undefined && (i+ctr)<=A[0] )
                 ctr++;   
   
           if( (ctr+i) >= A[0] )
              continue;      
           else{ 
              A=permute(A,i,i+ctr);
              pivot=A[i*A[0]+i+2];
              if(isNaN(pivot)){
                  throw new Error("Pivot is NaN, A[i*A[0]+i+2]="+A[i*A[0]+i+2])
              }
           };       
        };

        for(let h=i+1; h<A[0]; h++){

            if(pivot===0)
               throw new Error("Pivot zero.");

            let multiplier = A[h*A[0]+i+2]/pivot;   

            if(isNaN(multiplier))
               throw new Error("Multiplier is NaN A[h*A[0]+i+2] is "+A[h*A[0]+i+2]+" pivot is "+pivot);

            for(let z=i; z<A[0]; z++){

                 let entry = A[h*A[0]+z+2]-(A[i*A[0]+z+2]*multiplier);

                 if(isNaN(entry))
                    throw new Error("Entry is NaN, A[h*A[0]+z+2] is "+A[h*A[0]+z+2] + " (A[i*A[0]+z+2]*multiplier) " + (A[i*A[0]+z+2]*multiplier));

                 A[h*A[0]+z+2] = entry; 

            };           

        };         
    };  
    return A;    
}; 


let float64Matrix = ([i,j]) => { 
    let size = i*j*8;       
    let floats = new Float64Array(new ArrayBuffer(size+16));
    floats[0]=i; //rows   
    floats[1]=j; //columns        
    return floats; 
};   

let transpose = (A) => {
    let container = float64Matrix([3,3]);

    for(let i = 0; i<A[0]; i++)
      for(let j = 0; j<A[0]; j++)   
          container[2 + (j*A[0])+i]=A[2 + (i*A[0])+j];

    return container; 
};

export let rref = (A : Matrix_float64) : [Matrix_float64,number] => {
     
    let rank=A[0];
    //console.log("initial rank",rank);
    let top = elimination(A);
    //console.log("elimination 1",top);
    let transposed = transpose(top);
    //console.log(transposed,"transposed");
    let bottom = elimination(transposed);
    //console.log(bottom,"elimination 2");
  
  
    let array =  [];

    for(let i=0; i<9; i++)
        array.push(bottom[i+2]);
       
    let zeroRows = compose(  
        filter(identity as any),
        map(all(equals(0))), 
        map((threeNumbers:number[]) => 
           threeNumbers.map( 
               (v:number) => Math.abs(v) > Math.abs(8.3322676295501878e-15) ? v : 0
           )
        ),   
        splitEvery(3) 
    )(array); 
 
    return [bottom, rank-zeroRows.length];
     
 };  

 
 export let matrixRank = (A:number[][]) : number => {
      
    let array = clone(flatten(A));
    
    let float64Matrix = ([i,j]) => {  
        let size = i*j*8;       
        let floats = new Float64Array(new ArrayBuffer(size+16));
        floats[0]=i; //rows   
        floats[1]=j; //columns        
        return floats; 
    };   

    let matrix = float64Matrix([3,3]);
 
    for(let i=0; i<9; i++)
        matrix[i+2]=array[i];

    let [reduced, rank] = rref(matrix);

    return rank; 
 };