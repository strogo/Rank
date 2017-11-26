import { projectOnVector } from './../components/utils';
import { Matrix4 } from 'three';
import { Matrix3 } from 'three';
import { Vector3 } from 'three';
import { VectorMesh, Vector } from './vector';
import { PlaneBufferGeometry, MeshPhongMaterial, Mesh, DoubleSide, TextureLoader, Texture, ImageUtils, FlatShading, FrontSide, BackSide, MeshFaceMaterial, GeometryUtils, MeshPhysicalMaterial } from 'three'; 
import { getMaterial, materialType } from "./threeUtils";



export let Plane = (
    width:number, height:number, 
    widthSegments:number, heightSegments:number, 
    color : number,
    materialType : materialType 
) : Mesh => {
     
    let mesh = new Mesh();
 
    let geometry = new PlaneBufferGeometry(width, height, widthSegments, heightSegments);
    
    
    let material = getMaterial(materialType,color); 
     
    let plane = new Mesh(geometry,material);  
    
    let geometry2 = new PlaneBufferGeometry(width, height, widthSegments, heightSegments);
    
    let material2 = getMaterial(materialType,color);
         
    let plane2 = new Mesh(geometry,material);    
    
    plane2.applyMatrix(new Matrix4().makeRotationY(-Math.PI));
    
    mesh.add(plane);
    //mesh.add(plane2); 

    return mesh;

};

  

 
export let XYZPlanes = (x:boolean,y:boolean,z:boolean, color, materialType:materialType) : Mesh => {
    let Planes = new Mesh();
    
   
    if(y){
        let plane2 = Plane(100,100,2,2,color,materialType); 
        plane2.material.transparent=true;
        plane2.material.opacity=0.3;
        plane2.applyMatrix(new Matrix4().makeRotationX(Math.PI/2));
        Planes.add(plane2);
      };

    if(x){
        let plane  = Plane(100,100,2,2,color,materialType);
        plane.material.transparent=true;
        plane.material.opacity=0.3;
        Planes.add(plane);
    };
 
    if(z){
      let plane3 = Plane(100,100,2,2,color,materialType);   
      plane3.material.transparent=true; 
      plane3.material.opacity=0.3;
      plane3.applyMatrix(new Matrix4().makeRotationY(Math.PI/2));  
      Planes.add(plane3); 
    };
     
    return Planes; 
};


let fromZero = (v : Vector3) =>  v.x===0 && v.y===0 && v.z===0 ;


export let PlaneSubspace = (v1 : VectorMesh, v2 : VectorMesh, scene, materialType ) : Mesh => {

    if(!fromZero(v1.from) || !fromZero(v2.from))
        throw new Error("Plane for subspace should contain vectors from zero");
     
    let plane = Plane(100,100,2,2,0xff0000, materialType);  
    
    let basis1 = v1.to.clone();   
    let basis2 = v2.to.clone();

    let projected = projectOnVector(basis1.clone(),basis2.clone());
    
    basis1.sub(projected);  
     
    let basis3 = new Vector3().crossVectors(basis1,basis2);
    
    basis1.normalize();
    basis2.normalize();
    basis3.normalize();
  
    let m = new Matrix4().fromArray([
        basis1.x,   basis2.x,   basis3.x, 0,
        basis1.y,   basis2.y,   basis3.y, 0,
        basis1.z,   basis2.z,   basis3.z, 0, 
        0,          0,          0,        1
    ]);    
        
    m.transpose();
     
    plane.applyMatrix(m);    
    plane.material.transparent=true;
    plane.material.opacity=0.7;
       
    return plane;  
};

 
let setMeshTexture = (mesh : Mesh, texture) : Mesh => {
    //mesh.material.map = texture;
    mesh.material.needsUpdate = true;
 
    return mesh;
};


let textureFromCanvas = (canvas : HTMLCanvasElement) => {
    return new Texture(canvas);
};  
    

let loadTexture = () => {
    ImageUtils.loadTexture('texture.jpg'); 
    new TextureLoader().load('texture.jpg');
    //let material = new MeshPhongMaterial( { map: texture, side:DoubleSide } );
}; 

 

