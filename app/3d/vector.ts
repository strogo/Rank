import { MeshBasicMaterial } from 'three';
import { Matrix4 } from 'three';
import { compose, cond, equals } from 'ramda';
import { ConeBufferGeometry, MeshPhongMaterial, Mesh, Vector3, 
    CylinderBufferGeometry, LineCurve3, TubeGeometry, Box3, SphereBufferGeometry, Matrix3, Object3D, MeshPhysicalMaterial
} from 'three';
import { getMaterial, materialType } from "./threeUtils";
import { generateOrthonormalBasis } from "./vectorSpace";


 
let Cone = (radius:number, height:number, 
            radialSegments:number, heightSegments:number, 
            openEnded:boolean, color:number, materialType:materialType) : Mesh => {
            
   let geometry = new ConeBufferGeometry(radius, height, radialSegments, heightSegments, openEnded);

   let material =  getMaterial(materialType,color);
   
   let mesh = new Mesh(geometry,material);
   
   mesh.frustumCulled = false;
   //mesh.matrixAutoUpdate=false;
   

   return mesh;

};



let Cylinder = (radius:number, height:number, 
                radialSegments:number, heightSegments:number, 
                openEnded:boolean, color:number, materialType:materialType) : Mesh => { 
     
    let geometry = new CylinderBufferGeometry(radius,radius,height,radialSegments,heightSegments,openEnded);

    let material = getMaterial(materialType,color);                                      
    
       
    let mesh = new Mesh(geometry,material); 
    
    mesh.frustumCulled = false;

    //mesh.matrixAutoUpdate=false;
 
    return mesh;

}; 
    
let Sphere = (radius:number, color:number, materialType:materialType) : Mesh => {

    let geometry = new SphereBufferGeometry(radius,32,32);

    let material = getMaterial(materialType,color); 

    let mesh = new Mesh(geometry,material);

    return mesh;

};

 
let Tube = (
    from : Vector3, to : Vector3, 
    radius:number, segments:number, 
    color:number, materialType:materialType
) : Mesh => {
        
    let path = new LineCurve3(from, to);    
            
    let tubeGeometry = new TubeGeometry( path, segments, radius, segments );
       
    let material = getMaterial(materialType,color);  
    
    let mesh = new Mesh(tubeGeometry, material);

    //mesh.matrixAutoUpdate=false;
    mesh.frustumCulled = false;

    return mesh; 

}; 


export let getObjectCenter = ( object : Mesh ) : Vector3 => {
    
    let boundingBox = new Box3().setFromObject(object);

    let centerX = (boundingBox.max.x + boundingBox.min.x)/2;

    let centerY = (boundingBox.max.y + boundingBox.min.y)/2;

    let centerZ = (boundingBox.max.z + boundingBox.min.z)/2;
  
    return new Vector3(centerX,centerY,centerZ);
      
};  
    

export let getTopCenterPoint = ( object : Mesh ) : Vector3 => {
    
    let boundingBox = new Box3().setFromObject(object);
     
    let centerX = (boundingBox.max.x + boundingBox.min.x)/2;
  
    let topY = boundingBox.max.y; 
    
    let centerZ = (boundingBox.max.z + boundingBox.min.z)/2;
    
    return new Vector3(centerX,topY,centerZ);
     
}; 


export let getBottomCenterPoint = ( object : Mesh ) : Vector3 => {
    
    let boundingBox = new Box3().setFromObject(object);
     
    let centerX = (boundingBox.max.x + boundingBox.min.x)/2;
   
    let topY = boundingBox.min.y; 
    
    let centerZ = (boundingBox.max.z + boundingBox.min.z)/2;
    
    return new Vector3(centerX,topY,centerZ);
     
}; 


export let putDot = (position:Vector3) : Mesh => {
    let geometry = new SphereBufferGeometry(0.8,16,16);
    let material = new MeshBasicMaterial({color:0xff0000});
    let mesh = new Mesh(geometry,material);
    mesh.position.copy(position);
    return mesh;
}; 




/*
let orthogonalVector1 = (v : Vector3) : Vector3 => {
    if(v.z===0){
        return new Vector3()
               .fromArray([v.y, -v.x, v.y]);
    }else{
        return new Vector3()
               .fromArray([v.x * v.z,  v.y * v.z,  -(v.x*v.x + v.y*v.y)]);
    };
}; 
*/

export let multiplyMatrices = (m1 : Matrix3,m2 : Matrix3) : Matrix3 => {
    let el1 = m1.elements;
    let el2 = m2.elements;
    
    return new Matrix3().fromArray([
        el1[0]*el2[0] + el1[1]*el2[3] + el1[2]*el2[6],    el1[0]*el2[1] + el1[1]*el2[4] + el1[2]*el2[7],   el1[0]*el2[2] + el1[1]*el2[5] + el1[2]*el2[8],

        el1[3]*el2[0] + el1[4]*el2[3] + el1[5]*el2[6],    el1[3]*el2[1] + el1[4]*el2[4] + el1[5]*el2[7],   el1[3]*el2[2] + el1[4]*el2[5] + el1[5]*el2[8],

        el1[6]*el2[0] + el1[7]*el2[3] + el1[8]*el2[6],    el1[6]*el2[1] + el1[7]*el2[4] + el1[8]*el2[7],   el1[6]*el2[2] + el1[7]*el2[5] + el1[8]*el2[8]
    ]);
}; 

 
export let orthogonalVector2 = (v : Vector3) => {

    let r = multiplyMatrices(
        new Matrix3().fromArray(
            [
                1,  0,                     0,                     
                0,  Math.cos(Math.PI/2),  -Math.sin(Math.PI/2),   
                0,  Math.sin(Math.PI/2),   Math.cos(Math.PI/2),    
            ] 
        ),
        new Matrix3().fromArray(
            [
                Math.cos(Math.PI/2),  -Math.sin(Math.PI/2), 0, 
                Math.sin(Math.PI/2),   Math.cos(Math.PI/2), 0,  
                    0,                     0,               1,       
            ]
        ) 
    );

    let v2 = new Vector3(v.x,v.y,v.z).applyMatrix3(r);  
    
    return new Vector3().crossVectors(v,v2);
};
    
export interface VectorMesh {
    from : Vector3,
    to : Vector3, 
    mesh : Mesh 
}; 

 
export let createVector = (
    length:number, color:number=0x0000ff, 
    materialType:materialType, label:string[],
    increasedThickness?, def? 
) : Mesh => {  
    
    let vector = new Mesh(); 
 
    vector.userData.coordinates=label; 
        
    if(length<=0.000001){
       let sphere = Sphere(0.3,color,materialType);
       vector.add(sphere);
       return vector; 
    };     
    
    let smallDifference = 0;

    //while(smallDifference===0)
          //smallDifference=Math.random()*0.02;
     
    if(def)
       smallDifference=0.22      
  
    let cone = Cone(

        increasedThickness ? 0.8 : (0.6+smallDifference),
        
        2,32,32,false,color,materialType);
    cone.userData.coordinates=label;  
    cone.castShadow=true;     
                  
    let cylinder = Cylinder(
           
        increasedThickness ? 0.3 : (0.2+smallDifference),
        
        length-1,32,32,true,color,materialType); 
    cylinder.userData.coordinates=label;   
    cylinder.castShadow=true;
     
    let sphere = Sphere(0.3,color,materialType);
       
    cone.position.copy(
        getTopCenterPoint(cylinder)
        .sub(
            new Vector3(
              0,cone.geometry["parameters"].height/10,0
            ) 
        )
    );   
    //.multiplyScalar(0.97));  
    //cone.applyMatrix(new Matrix4().makeTranslation(0,-0.9,0));
     
    vector.add(cylinder);    

    //vector.add(putDot(getTopCenterPoint(cylinder)))
        
    vector.add(cone); 

    let bottom = getBottomCenterPoint(vector);

    //vector.add(putDot(getBottomCenterPoint(cylinder))); 
 
    vector.applyMatrix(new Matrix4().makeTranslation(-bottom.x,-bottom.y,-bottom.z));
       
    vector.frustumCulled = false; 
 
    sphere.position.copy(getBottomCenterPoint(cylinder));
         
    vector.add(sphere);

    return vector; 
};  
 

let X = (v : Vector3) => { 
    let x = v.x;
    let y = v.y; 
    let z = v.z;

    return x!=0 && y==0 && z==0;
};
  
let Y = (v : Vector3) => {
    let x  = v.x;
    let y = v.y;
    let z = v.z;

    return x==0 && y!=0 && z==0;
};
  
let Z = (v : Vector3) => {
    let x  = v.x;
    let y = v.y;
    let z = v.z;

    return x==0 && y==0 && z!=0;
};
 


export let Vector = (
    scale:number, 
    from : Vector3, to : Vector3, 
    materialType : materialType, color : number=0x0000ff,
    increasedThickness?, def?
) : VectorMesh => {    

    let label = [to.x.toFixed(2),  to.y.toFixed(2),  to.z.toFixed(2)];     

    let length = new Vector3(to.x,to.y,to.z).sub(from).length(); 
      
    let vector : Mesh = createVector(length*scale, color, materialType, label, increasedThickness, def); 

    vector.userData.coordinates = [to.x.toFixed(2),  to.y.toFixed(2),  to.z.toFixed(2)];
        
    vector.applyMatrix(new Matrix4().makeRotationZ(-Math.PI/2)); 
      
    //vector.userData.type="vector"; 
    
    let fromTranslated = new Vector3().fromArray([0,0,0]);
    let toTranslated = new Vector3().copy(to).sub(from); 

    let rotation;
 
    if(X(toTranslated)) 
       rotation = new Matrix4().makeRotationY(Math.PI/4);
    else if(Y(toTranslated))
       rotation = new Matrix4().makeRotationX(Math.PI/4);  
    else if(Z(toTranslated)) 
       rotation = new Matrix4().makeRotationY(Math.PI/4);
    else 
       rotation = new Matrix4().makeRotationX(Math.PI/4);     
    

    let first = toTranslated.clone();
     
    let second = toTranslated.clone().applyMatrix4(rotation);
 
    let matrix = generateOrthonormalBasis(first,second); 
        
    vector.applyMatrix(matrix);  

    let bottom = getBottomCenterPoint(vector);

    vector.applyMatrix(new Matrix4().makeTranslation(from.x,from.y,from.z));
    
    vector.castShadow=true;
  
    return {  
        from : new Vector3(from.x,from.y,from.z),//.multiplyScalar(scale),
        to : new Vector3(to.x,to.y,to.z),//.multiplyScalar(scale), 
        mesh : vector
    }; 
     
};    




