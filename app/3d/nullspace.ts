import { splitEvery, map, sum, flatten, filter, compose, all, equals, identity, clone, drop, isNil } from "ramda";
import { Matrix3 } from "three";
import { matrixRank } from "./rref";
let N = require("numeric");
const {
    Matrix,
    inverse,
    solve,
    linearDependencies,
    QrDecomposition,
    LuDecomposition,
    CholeskyDecomposition,
    SingularValueDecomposition
} = require('ml-matrix');
 

//right nullspace

//columns!
export let getNullspaceQR = (A:number[][]) : number[][] => {

    let transposed = N.transpose(
        A 
    ); 

    var Atransposed = new Matrix(transposed); 
    
    var QR = new QrDecomposition(Atransposed);
    var Q = QR.orthogonalMatrix;
    //var R = QR.upperTriangularMatrix;

    let rank = matrixRank(clone(transposed));  

    if(rank===3)    
        return []; 
  
    let qTransposed = Q//.transpose();
        
    switch(rank){
        case 0:
            return [qTransposed[0],qTransposed[1],qTransposed[2]]; 
        case 1: 
            return [qTransposed[1],qTransposed[2]]; 
        case 2: 
            return [qTransposed[2]]; 
        default:
            throw new Error(`Rank has incorrect value : ${rank}, matrix is ${A}`);
    }; 
    
};



//columns!
export let getNullspace = (A:number[][]) : number[][] => {
    //let x = linalg ;
    if(isNil(A))
        return [[0,0,0],[0,0,0],[0,0,0]]; 
    
 
    let rank = matrixRank(A);
    if(rank===3)    
        return [[0,0,0],[0,0,0],[0,0,0]];   

    let rows = [];

    let transposed : number[][] = new Matrix(A);//.transpose();  
      

    let svd = new SingularValueDecomposition(transposed);

    let V = svd.V;  
     
    let vTransposed = new Matrix(V).transpose(); 
          
    switch(rank){  
        case 0:
           return [vTransposed[0],vTransposed[1],vTransposed[2]]; 
        case 1:
           return [vTransposed[1],vTransposed[2],[0,0,0]]; 
        case 2:
           return [vTransposed[2],[0,0,0],[0,0,0]];  
        default:
           throw new Error(`Rank has incorrect value : ${rank}, matrix is ${A}`);
    }; 
};




//left nullspace  
export let getLeftNullspace = (A:number[][]) : number[][]=> {
    if(isNil(A))
        return [[0,0,0],[0,0,0],[0,0,0]];   

    let rows = [];
    let rank = matrixRank(A);
  
    if(rank===3)
       return [[0,0,0],[0,0,0],[0,0,0]]; 

    let svd = new SingularValueDecomposition(new Matrix(A));
 
    let U = svd.U; 
    let transposedU = new Matrix(U).transpose();   
 
    switch(rank){  
        case 0:
           return [transposedU[0], transposedU[1], transposedU[2]]; 
        case 1:
           return [transposedU[1], transposedU[2], [0,0,0]]; 
        case 2:
           return [transposedU[2], [0,0,0], [0,0,0]];   
        default:
           throw new Error(`Rank has incorrect value : ${rank}, matrix is ${A}`);
    };  
};

