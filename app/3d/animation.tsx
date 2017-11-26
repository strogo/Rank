import { Mesh, Font, TextGeometry, Box3, MeshPhongMaterial, WebGLRenderer, Vector3, Raycaster, Vector2, Intersection, PerspectiveCamera, Scene, Light, Matrix4, Texture, MeshLambertMaterial, CanvasTexture, MeshBasicMaterial, LineCurve3, Quaternion, Line, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments, OrbitControls, Matrix3, Geometry, LineDashedMaterial, Shape, PlaneGeometry, PlaneBufferGeometry, ShapeUtils, Face3, DoubleSide } from "three";
import { Observable } from 'rxjs/Rx';
import { find, compose, multiply, reduce, maxBy, identity, map, curry, sortBy, path, isNil, sum,
    last, flatten, equals, addIndex, assocPath, cond, range, clone, merge, concat, prepend, isEmpty } from 'ramda';
import { Component } from 'react';
import * as React from 'react';
import { initScene, initCamera, initRenderer, initControls, initLights } from "./threeSetup";
import { Vector, putDot, VectorMesh, getTopCenterPoint, getBottomCenterPoint, multiplyMatrices } from "./vector";
import '../assets/styles.css';     
import { Plane, PlaneSubspace, XYZPlanes } from "./plane";
import { init2dCanvasContext, putDot2d, MarkUp } from "./markUp";
import { getMousePosition, makeMeshTransparent, getElementDimensions, 
    line, animate, setupEventListeners, onResize, subscribeToResize, subscribeToMouseMove, subscribeToMouseDown, 
    textMesh, 
    scaleVectorInstantly,
    dashedLine,
    materialType,
    getMaterial,
    animateFadeInAction, 
    animateFadeOut,
} from "./threeUtils";
import { grid, generateGrid, generateMarkup } from "./grid";
import { attachDispatchToProps, projectOnVector, isVector } from "../components/utils";
import { connect } from "react-redux";
import { Subscription } from "rxjs/Subscription";
import { removeObjectsFromScene, generateOrthonormalBasis, getNotImportantFromScene, generatePlaneFromVertices, makeParallelogramm, clear } from "./vectorSpace";
import { animationHOF, AnimationController, animationHOFchain, 
    //animationHOFchainTEST, 
    //animationHOFTest 
} from "./animationUtils";
let uniqid = require('uniqid'); 
  


export function randomColor() {
    var color = Math.floor(0x1000000 * Math.random());
    return  color;
};



 
export let moveFromAtoBAction = (
    a : Vector3,
    b : Vector3,
    vector:VectorMesh,
    scene:Scene,
    scale:number   
) => {          

    let aScaled = new Vector3().fromArray([a.x*scale, a.y*scale, a.z*scale]);
    let bScaled = new Vector3().fromArray([b.x*scale, b.y*scale, b.z*scale]);
    
    let line = new LineCurve3(
        aScaled,
        bScaled
    ); 

    let bottom = getBottomCenterPoint(vector.mesh);
    let top = getTopCenterPoint(vector.mesh);
    let lastPoint = new Vector3(0,0,0);


    return (counter : number) => {   

        if(line===undefined)
           return; 

        if(counter===0)
           scene.add(vector.mesh);   
 

        if(counter>0.95) 
           counter=1;

        let point = line.getPoint(counter);   
           
        //let target = point.add(bottom); 
        //point.add(vector.to.clone().multiplyScalar(scale).multiplyScalar(1/2));
        vector.mesh.position.sub(lastPoint); 
        vector.mesh.position.add(point);//set(target.x,target.y,target.z); 
        lastPoint=point;  

        if(counter===1){
           aScaled = undefined;
           bScaled = undefined;
            
           line = undefined;
        
           bottom = undefined;
           top = undefined;
           lastPoint = undefined;
        }
 
        return vector.mesh; 
    };      
       
};  



 
export let scaleByAction = (
    scene:Scene, vector:VectorMesh, scalar:number, scale,
    materialType:materialType, color:number, speed:number
) => { 
    let from : Vector3 = new Vector3(vector.from.x,vector.from.y,vector.from.z);
    let target : Vector3 = new Vector3(vector.to.x,vector.to.y,vector.to.z).sub(from).multiplyScalar(scalar);    
    let line = new LineCurve3(new Vector3(vector.to.x,vector.to.y,vector.to.z), target);  
    let last=vector;
    let point;
    
    return (counter:number) => { 

        if(line===undefined)
           return; 

        point = line.getPoint(counter);  
 
        if(last){
            last.mesh.traverse(clear(scene));
            scene.remove(last.mesh); 
            last = undefined;
        }
             
        if((counter+speed)<1){
            

            last=Vector(scale,from,point,materialType,color); 
            scene.add(last.mesh);
            
 

        }else{
            
            last=Vector(scale,from,target,materialType,color); 
            scene.add(last.mesh); 
            let mesh = last.mesh;
            last = undefined;
            from = undefined;
            target = undefined;  
            line = undefined;  
            point = undefined;
            return mesh; 
 
        };

        return last.mesh; 

    }; 
}; 
  
    
  
export let animateAddVectors = (
    v1 : VectorMesh, v2 : VectorMesh, 
    materialType:materialType, scale:number,
    scene:Scene, speed:number, color:number,
    clear?
) : AnimationController => {  
    let added=false;
    
    let sum = Vector( 
        scale,  
        new Vector3(0,0,0), 
        new Vector3().add(v1.to).add(v2.to),
        materialType,
        color  
    ); 
     
    let fadeinController = animationHOF(    
        speed, 
        animateFadeInAction([sum.mesh])
    );       
        
    let motionController = animationHOF(     
        speed, 
        moveFromAtoBAction(     
            v2.from,v1.to,
            v2,scene,scale
        )   
    ).onEnd(     
        (data:any) => {         
            //makeMeshTransparent(sum.mesh,0);
            scene.add(sum.mesh);     
        }      
    );      
     
    let controller = animationHOFchain([motionController, fadeinController], speed, () => {
        if(!clear)
            if(!added){ 
                scene.add(v1.mesh);
                added=true; 
            }; 
    });    

    //if(v2.to.length()===0 || v1.to.length()===0)
       //setTimeout(controller.stop, 500)  
 
    return controller;   
};   
  


export let animateScaleBy = (
    scene:Scene, vector:VectorMesh, scalar:number, scale,
    materialType:materialType, color:number, speed:number
) : AnimationController => 
    animationHOF(    
        speed, 
        scaleByAction(
            scene, vector, scalar, scale,
            materialType, color, speed
        )
    );  
 





export let animateMultiplyScalarVector = (
    scene:Scene, vector:Vector3, scalar:number, 
    materialType:materialType, speed:number,
    scale:number   
) : AnimationController => 
    animateScaleBy(
        scene,
        Vector(scale,new Vector3(0,0,0),vector,materialType),
        scalar,
        scale,
        materialType,
        randomColor(),
        speed
    );
 
  


export let dashedAngleAction = (
    v1 : Vector3, v2 : Vector3, 
    scene:Scene, textSize:number, 
    camera, color:number=0x00ff00
) => {
    let v1normalized = new Vector3(v1.x,v1.y,v1.z).normalize();
    let v2normalized = new Vector3(v2.x,v2.y,v2.z).normalize();
        
    let cosOfAngle : number = v1normalized.dot(v2normalized);
    cosOfAngle = Math.round(cosOfAngle*100000)/100000;   
    let angle = Math.acos(cosOfAngle); 
    let vectorLength = v1.length() > v2.length() ? v2.length() : v1.length(); 
    let line; 
        
    return (counter:number) : Line => { 
        let geometry = new Geometry(); 
        let lineMaterial = new LineDashedMaterial({ color: color, dashSize: 0.2, gapSize: 0.2, linewidth: 3 }); 
 
        counter = (counter > 0.9) ? 1 : counter;
 
        let points = []; 

        if(line){
           line.traverse(clear(scene));
           line = undefined; 
        } 
  
        for(let j=0.001; j<=counter*angle; j+=0.001)    
            points.push(  
                rotateVectorInsideSubspace( 
                   v1, v2, vectorLength/2, -j
                ) 
            );    

        addIndex(map)(
            (v : Vector3, idx : number) => { 
            geometry.vertices[idx]=v; 
        })(points);
    
        geometry.computeLineDistances(); 
    
        line = new Line(geometry, lineMaterial);  
    
        scene.add(line); 

        if(counter===1){
            v1normalized = undefined;
            v2normalized = undefined;
            cosOfAngle = undefined;
            angle = undefined; 
            vectorLength = undefined;
        }
 
        return line; 
    };
};  
 



export let animateDashedAngle = (
    v1 : Vector3, v2 : Vector3, 
    scene:Scene, textSize:number, 
    camera, scale:number, color:number=0x00ff00
) : AnimationController => 
    animationHOF(
        0.05,
        dashedAngleAction(     
            new Vector3(v1.x, v1.y, v1.z).multiplyScalar(scale),  
            new Vector3(v2.x, v2.y, v2.z).multiplyScalar(scale), 
            scene, textSize,    
            camera, color
        )
    ); 


 


export let multiplyVectorVectorAction = (
    scene:Scene, v11:Vector3, v22:Vector3, 
    textSize:number, camera:PerspectiveCamera, 
    materialType:materialType, scale:number, 
    speed, color:number=0x00ff00
) => {   
    speed=0.05; 
    let v1=new Vector3(v11.x, v11.y, v11.z);
    let v2=new Vector3(v22.x, v22.y, v22.z);   
    
    let vector1 = Vector(scale, new Vector3(0,0,0),v1,materialType,randomColor());
    let vector2 = Vector(scale, new Vector3(0,0,0),v2,materialType,randomColor());
     
    let projection = v1.clone().projectOnVector(v2.clone());
    let path = new LineCurve3( 
        v1.clone(),//.multiplyScalar(scale), 
        projection.clone()//.multiplyScalar(scale)
    );  
     
    let line;     
    let pathVector;    
    let added=false;

    return (counter:number) => {
        if(!added){
            scene.add(vector1.mesh);  
            scene.add(vector2.mesh);
            added=true; 
        }; 

        if(counter>0.90)
           counter=1;         
            
        if(line){     
           line.traverse(clear(scene));
           line = undefined; 
        }

        if(pathVector){ 
           pathVector.mesh.traverse(clear(scene));
           pathVector = undefined; 
        }
        
        let newPoint = path.getPoint(counter); 
                
        line = dashedLine(v1.clone().multiplyScalar(scale), newPoint.clone().multiplyScalar(scale), color); 
        pathVector = Vector(scale, new Vector3(0,0,0), newPoint,materialType,color);
         
        scene.add(line);
        scene.add(pathVector.mesh);
 
        if(counter===1){
            v1=undefined;
            v2=undefined;  
            vector1=undefined; 
            vector2=undefined; 
            projection=undefined; 
            path=undefined; 
            added=undefined;
        }

        return [line as Mesh, pathVector.mesh]; 
    };       
};   




export let animateMultiplyVectorVector = ( 
    scene:Scene, v11:Vector3, v22:Vector3,  
    textSize:number, camera:PerspectiveCamera, 
    materialType:materialType, scale:number, 
    speed:number, color:number=0xff0000 
) : AnimationController => {   
    let projectionAction = multiplyVectorVectorAction(   
        scene, v11, v22, 
        textSize, camera, 
        materialType, scale, 
        speed, color 
    ); 
     
    let projectionController = animationHOF(speed, projectionAction)
    .onEnd(
        ([line,vector]) => {
            let fadeoutAction = animateFadeOut([line,vector]);  
 
            projectionController = animationHOF(speed, fadeoutAction)
                                    .onEnd(() => {  
                                       line.traverse(clear(scene));
                                       line = undefined;

                                       vector.traverse(clear(scene));
                                       vector = undefined;
                                    }); 
    
            projectionController.start(); 
        }
    );  
    
    let dashedAngleController = animateDashedAngle(
        v11, v22, scene, textSize, camera, scale, color
    );  
 
    return animationHOFchain([projectionController,dashedAngleController], speed, () => {});
}; 

 


export let animateSubMatrixMatrix = (
    m1 : Matrix3 , m2 : Matrix3, 
    color:number, materialType:materialType, 
    scene:Scene, scale:number, speed : number  
) : AnimationController => {
       
    let m11array = [];
    let m22array = [];
    
    for(let i=0; i<m1.elements.length; i++){
        m11array.push(m1.elements[i]);
        m22array.push(m2.elements[i]);
    };
    
    let m11 = new Matrix3().fromArray(m11array);
    let m22 = new Matrix3().fromArray(m22array);
     
    let negated = m22.clone().multiplyScalar(-1);
  
    return animateAddMatrixMatrix(
        m11, negated, 
        color, materialType,
        scene, scale, speed 
    ); 

}; 
 



export let animateAddMatrixMatrix = (
    m1 : Matrix3 , m2 : Matrix3, 
    color:number, materialType:materialType, 
    scene:Scene, scale:number, speed:number 
) : AnimationController => {
     
    let a = new Vector3(m1.elements[0],m1.elements[3],m1.elements[6]);
    let b = new Vector3(m1.elements[1],m1.elements[4],m1.elements[7]);
    let c = new Vector3(m1.elements[2],m1.elements[5],m1.elements[8]);
    
    let x = new Vector3(m2.elements[0],m2.elements[3],m2.elements[6]);
    let y = new Vector3(m2.elements[1],m2.elements[4],m2.elements[7]);
    let z = new Vector3(m2.elements[2],m2.elements[5],m2.elements[8]);
    
    let VectorFromZero = (v : Vector3) => Vector(scale, new Vector3(0,0,0), v, materialType, color);
    
    let nil = () => compose(equals(0),sum,flatten)([clone(m1.elements),clone(m2.elements)]); 

    let av = VectorFromZero(a);
    let bv = VectorFromZero(b);
    let cv = VectorFromZero(c);

    scene.add(av.mesh);
    scene.add(bv.mesh); 
    scene.add(cv.mesh);
     
    let xv = VectorFromZero(x); 
    let yv = VectorFromZero(y); 
    let zv = VectorFromZero(z); 

    scene.add(xv.mesh); 
    scene.add(yv.mesh);
    scene.add(zv.mesh);

    let rndColor = randomColor();

    let fadein = animateFadeInAction([xv.mesh,
                                      yv.mesh,
                                      zv.mesh]);

    let c0 = animationHOF(speed,fadein);
 
    let c1 = animateAddVectors( 
        av,
        xv,
        materialType,
        scale,
        scene,
        speed,
        color
    );

    let c2 = animateAddVectors(  
        bv,
        yv,
        materialType,
        scale,
        scene,
        speed,
        color
    );

    let c3 = animateAddVectors(
        cv,
        zv, 
        materialType,  
        scale,
        scene,
        speed, 
        color
    );
    
    let fadeoutAction = animateFadeOut([
        av.mesh,bv.mesh,cv.mesh,
        xv.mesh,
        yv.mesh,
        zv.mesh
    ]);    

    let added = true;  
 
    return animationHOFchain([ 
        c1,c2,c3,  
        animationHOF(speed,fadeoutAction)
        .onEnd(() => {  
            map((m:Mesh) => {
                m.traverse(clear(scene));
                m=undefined;
                return m;
            })([av.mesh,bv.mesh,cv.mesh,xv.mesh,yv.mesh,zv.mesh])
        })
    ],    
 
    speed,  

    () => {
        if(!added){  
                scene.add(av.mesh);
                scene.add(bv.mesh); 
                scene.add(cv.mesh);

                scene.add(xv.mesh); 
                scene.add(yv.mesh);
                scene.add(zv.mesh);

                added=true;
        };
    }); 
    
};

 


 
export let animateSubVectorVector = (
    scene:Scene, 
    v1:VectorMesh, v2:VectorMesh, 
    materialType:materialType, 
    color:number,
    speed:number,
    scale:number  
) : AnimationController => {
     
    scene.add(v1.mesh);           
   
    return animationHOFchain(
        [ 
         animateScaleBy(scene,v2,-1,scale,materialType,color,speed), 
         animateAddVectors(
             v1,
             Vector(
                 scale, 
                 new Vector3(0,0,0), 
                 new Vector3(v2.to.x, v2.to.y, v2.to.z).multiplyScalar(-1), 
                 materialType, 
                 color
             ),
             materialType,
             scale,
             scene,
             speed,
             color 
         )
        ],
         speed,
         () => {}
     ); 

};
    



 
export let addThreeVectors = (
    scene:Scene, 
    v1:VectorMesh, v2:VectorMesh, v3:VectorMesh, 
    materialType:materialType, 
    color:number, 
    speed:number,
    scale:number,  
    clear?
) : AnimationController => 
    animationHOFchain([
        animateAddVectors(v1, v2, materialType, scale, scene, speed, color,clear),
        animateAddVectors(
            Vector(scale,  new Vector3(0,0,0), v1.to.add(v2.to), materialType, color), 
            v3, materialType, scale, scene, speed, color,clear)
        ],
        speed, 
        () => {}
    );
 
  

 


export let animateMultiplyMatrixVector = (
    m : Matrix3 , v : Vector3, 
    color, speed:number, 
    materialType:materialType,
    scene:Scene,
    scale:number,
    cleared?:boolean    
) : AnimationController => {  
    let mx = new Vector3(m.elements[0],m.elements[3],m.elements[6]);
    let my = new Vector3(m.elements[1],m.elements[4],m.elements[7]);
    let mz = new Vector3(m.elements[2],m.elements[5],m.elements[8]);

    let VectorFromZero = (v : Vector3, color) => Vector(scale, new Vector3(0,0,0), v, color);
     
    let av = VectorFromZero(mx.clone(),color);
    let bv = VectorFromZero(my.clone(),color);
    let cv = VectorFromZero(mz.clone(),color);

    let toClear = [];
    
    let controller = animationHOFchain(
        [animateScaleBy(
            scene, 
            av,
            v.x,
            scale,   
            materialType,
            color,
            speed
        ),  
        animateScaleBy(  
            scene,
            bv, 
            v.y,
            scale,
            materialType,
            color,
            speed
        ), 
        animateScaleBy(
            scene,
            cv,
            v.z,     
            scale,
            materialType,
            color,
            speed 
        )],
        speed,
        () => {} 
    ).onEnd(() => {
        let vectorsMeshes = controller.getData();
        toClear.push(vectorsMeshes); 
    });

    let vm1 = Vector(scale, new Vector3(0,0,0), mx.clone().multiplyScalar(v.x)
    ,materialType, color);
    let vm2 = Vector(scale, new Vector3(0,0,0), my.clone().multiplyScalar(v.y)
    ,materialType, color);
    let vm3 = Vector(scale, new Vector3(0,0,0), mz.clone().multiplyScalar(v.z)
    ,materialType, color);

     
    let controller2 = addThreeVectors(
        scene,
        vm1,vm2,vm3,  
        materialType, 
        color, 
        speed, 
        scale,
        cleared      
    ).onEnd(
        () => {
            console.log("ended")
            let vectorMeshes = controller2.getData();
            toClear.push(vectorMeshes); 
        }
    );  
      
    return animationHOFchain([
        controller,
        controller2], speed, () => {})
    .onEnd((data) => {
        
        let enclosure = encloseThreeVectors(
                mx.clone().multiplyScalar(v.x).multiplyScalar(scale),
                my.clone().multiplyScalar(v.y).multiplyScalar(scale),
                mz.clone().multiplyScalar(v.z).multiplyScalar(scale), 
                scale, 
                false,
                materialType,  
                0x00ff00
            );

        scene.add(enclosure); 

        toClear.push(enclosure);

        if(cleared){
           let meshes = flatten( concat(toClear,data) ).filter(identity); 
           let fadeoutAction = animateFadeOut(meshes);       
             
           animationHOF(speed, fadeoutAction) 
           .start()  
           .onEnd(() => {   
                map((m:any) => {
                    m.traverse(clear(scene));
                    m = undefined; 
                })(meshes);
           })
        }
    });  
};


export let encloseThreeVectors = ( 
    v1:Vector3, v2:Vector3, v3:Vector3, scale, 
    showHat:boolean, materialType:materialType, color:number
) : Mesh => {  
    //let hat =  generatePlaneFromVertices ([v1,v2,v3], materialType, color); 
    
    let shape2 =  generatePlaneFromVertices(
        [
            new Vector3(0,0,0),
            new Vector3(v1.x,v1.y,v1.z),
            new Vector3(v2.x,v2.y,v2.z)
        ], 
        materialType, 
        color
    );   
    
    let shape3 =  generatePlaneFromVertices(
        [
            new Vector3(0,0,0),
            new Vector3(v3.x,v3.y,v3.z),
            new Vector3(v2.x,v2.y,v2.z)
        ], 
        materialType, 
        color
    );   
    
    let shape4 =  generatePlaneFromVertices(
        [
            new Vector3(0,0,0),
            new Vector3(v1.x,v1.y,v1.z),
            new Vector3(v3.x,v3.y,v3.z)
        ], 
        materialType,  
        color
    );     
         
    let shape = [shape2, shape3, shape4]; 
 
    //if(showHat)
       //shape=prepend(hat,shape);  
      
    //shape.map((m) => makeMeshTransparent(m,0.8));
    
    let target = new Mesh();
    
    map((o:Mesh) => {target.add(o)})(shape);
 
    return target; 
}; 
   

export let animateMultiplyMatrixMatrix = ( 
    m1 : Matrix3 , m2 : Matrix3, 
    colors:number[], speed:number, 
    materialType:materialType,
    scene:Scene,
    scale:number  
) : AnimationController => { 
    //VectorMesh[] + Mesh
     
    let m1x = new Vector3(m1.elements[0],m1.elements[3],m1.elements[6]);
    let m1y = new Vector3(m1.elements[1],m1.elements[4],m1.elements[7]);
    let m1z = new Vector3(m1.elements[2],m1.elements[5],m1.elements[8]);
 
    let m2x = new Vector3(m2.elements[0],m2.elements[3],m2.elements[6]);
    let m2y = new Vector3(m2.elements[1],m2.elements[4],m2.elements[7]);
    let m2z = new Vector3(m2.elements[2],m2.elements[5],m2.elements[8]);
    
    let result = multiplyMatrices(m1,m2);
     
    let m11 = new Matrix3().fromArray([
         m1.elements[0],m1.elements[1],m1.elements[2],
         m1.elements[3],m1.elements[4],m1.elements[5],
         m1.elements[6],m1.elements[7],m1.elements[8]
    ]);   

    let first = animateMultiplyMatrixVector(
        m11.clone(), m2x, 0xff0000, speed,materialType,scene,scale,true
    ).onEnd(
        (data:any[]) => { map((m:Mesh) => { 

            if(m){
                m.traverse(clear(scene));
                m = undefined;
            }

        })(flatten(data)) }
    );
     
    let second = animateMultiplyMatrixVector(
        m11.clone(), m2y, 0x00ff00, speed,materialType,scene,scale,true
    ).onEnd(
        (data:any[]) => { map((m:Mesh) => { 

            if(m){
                m.traverse(clear(scene));
                m = undefined;
            }

        })(flatten(data)) }
    );
    
    let third = animateMultiplyMatrixVector( 
        m11.clone(), m2z, 0x0000ff, speed,materialType,scene,scale,true
    ).onEnd(
        (data:any[]) => { map( (m:Mesh) => { 
            if(m){
                m.traverse(clear(scene));
                m = undefined;
            }
        } )(flatten(data)) }
    );
    
    return animationHOFchain(   
        [first,second,third],  
        speed,  
        () => {}    
    ).onEnd(  
        (data) => { 
            
            map((m:Mesh) => {
                if(m){ 
                    m.traverse(clear(scene));
                    m = undefined;
                }
            })(flatten(data));  
             
            let mx = new Vector3(result.elements[0],result.elements[3],result.elements[6]);
            let my = new Vector3(result.elements[1],result.elements[4],result.elements[7]);
            let mz = new Vector3(result.elements[2],result.elements[5],result.elements[8]);

            let r1 = randomColor();
            let r2 = randomColor();
            let r3 = randomColor();
 
            //result 
            let vx = Vector(scale, new Vector3(0,0,0), mx, materialType, r1
            //0xb20000
        );
            let vy = Vector(scale, new Vector3(0,0,0), my, materialType, r1
            //0xb20000
        );   
            let vz = Vector(scale, new Vector3(0,0,0), mz, materialType, r1
            //0xb20000
        );

            //left
            let v1x = Vector(scale, new Vector3(0,0,0), m1x.clone(), materialType, r2
              //0xff8000
            );
            let v1y = Vector(scale, new Vector3(0,0,0), m1y.clone(), materialType, r2 
              //0xff8000
            );   
            let v1z = Vector(scale, new Vector3(0,0,0), m1z.clone(), materialType, r2 
              //0xff8000
            );
             
            //right
            let v2x = Vector(scale, new Vector3(0,0,0), m2x.clone(), materialType, r3
                //0xadd8e
            );
            let v2y = Vector(scale, new Vector3(0,0,0), m2y.clone(), materialType, r3
                //0xadd8e6 
            );   
            let v2z = Vector(scale, new Vector3(0,0,0), m2z.clone(), materialType, r3
                //0xadd8e6
            );  
            
            let enclosure1 = encloseThreeVectors(
                m1x.clone().multiplyScalar(scale), 
                m1y.clone().multiplyScalar(scale), 
                m1z.clone().multiplyScalar(scale), 
                scale,     
                false,  
                materialType, 
                r2 //0xff8000 //orange
            );     

            let enclosure2 = encloseThreeVectors(
                m2x.clone().multiplyScalar(scale), 
                m2y.clone().multiplyScalar(scale), 
                m2z.clone().multiplyScalar(scale), 
                scale,   
                false,  
                materialType, 
                r3 //0xadd8e6 //light blue
            );      
        
            let enclosure3 = encloseThreeVectors(
                mx.clone().multiplyScalar(scale), 
                my.clone().multiplyScalar(scale), 
                mz.clone().multiplyScalar(scale), 
                scale,    
                false,   
                materialType,  
                r1 //0xb20000 //soft red
            );    

            //left
            scene.add(enclosure1);
            scene.add(v1x.mesh); 
            scene.add(v1y.mesh);
            scene.add(v1z.mesh);   
            
            /*//right
            scene.add(enclosure2);
            scene.add(v2x.mesh);
            scene.add(v2y.mesh);
            scene.add(v2z.mesh);*/
 
   
            //result
            scene.add(enclosure3);
            scene.add(vx.mesh);
            scene.add(vy.mesh);
            scene.add(vz.mesh); 
        }
    ); 
}; 
 


 
 

export let animateMultiplyVectorMatrix = (
    v : Vector3, m1 : Matrix3, 
    color:number, speed:number, 
    materialType:materialType,
    scene:Scene, scale:number 
) : AnimationController => {

    let m11 = [];
    for(let i=0; i<m1.elements.length; i++)
        m11.push(m1.elements[i]);

    let m11matrix = new Matrix3().fromArray(m11);
     
    let transposed = m11matrix.transpose();


    return animateMultiplyMatrixVector(
        transposed, v, 
        color,   
        speed, 
        materialType,
        scene,
        scale  
    );

};





 

export let animateMultiplyScalarMatrix = (
    scene:Scene, matrix:Matrix3, 
    scalar:number, materialType:materialType,
    speed:number, scale:number
) : AnimationController => {  

    let vx = new Vector3(matrix.elements[0], matrix.elements[3], matrix.elements[6]);
    let vy = new Vector3(matrix.elements[1], matrix.elements[4], matrix.elements[7]);
    let vz = new Vector3(matrix.elements[2], matrix.elements[5], matrix.elements[8]);
    
    let v1 = Vector(scale, new Vector3(0,0,0), vx, materialType);
    let v2 = Vector(scale, new Vector3(0,0,0), vy, materialType);
    let v3 = Vector(scale, new Vector3(0,0,0), vz, materialType);
       
    return  animationHOFchain(  
        [   
          animateScaleBy(scene, v1, scalar, scale, materialType, randomColor(), speed),
          animateScaleBy(scene, v2, scalar, scale, materialType, randomColor(), speed),
          animateScaleBy(scene, v3, scalar, scale, materialType, randomColor(), speed)
        ],  
        speed, 
        () => {} 
    ); 
}; 

 
export let crossProductAction = (
    scene:Scene, 
    v1 : Vector3, 
    v2 : Vector3, 
    color:number,   
    speed:number, 
    scale:number, 
    materialType:materialType  
) => {
    v1 = new Vector3(v1.x,v1.y,v1.z);
    v2 = new Vector3(v2.x,v2.y,v2.z);
       
    let vector1 = Vector(scale,new Vector3(0,0,0),v1,materialType,randomColor());
    let vector2 = Vector(scale,new Vector3(0,0,0),v2,materialType,randomColor());
    let cross = new Vector3().crossVectors(v1,v2);
    let length = cross.length();
    let colorRandom = randomColor();
    let crossNormalized = cross.clone().normalize();
    let vector3 = Vector(scale,new Vector3(0,0,0),crossNormalized,materialType); 

    let parallelogramm;
    let lastVector; 

    return (counter:number) => {    

        if(parallelogramm){
            parallelogramm.traverse(clear(scene));
            parallelogramm = undefined;
        }

        if(lastVector){
            lastVector.mesh.traverse(clear(scene));
            lastVector.mesh = undefined;
        }
        
        if(counter===0){
            scene.add(vector1.mesh);
            scene.add(vector2.mesh); 
        }; 
         
        counter = counter > 0.9 ? 1 : counter;   
  
        parallelogramm = makeParallelogramm(
            v1.clone().multiplyScalar(scale),
            v2.clone().multiplyScalar(scale),
            counter*100,
            materialType,
            color 
        );   

        lastVector = scaleVectorInstantly(vector3,length*counter,materialType,scale,color);   
 
        scene.add(parallelogramm);
        scene.add(lastVector.mesh); 

    }; 
};  


 
export let animateVectorCrossVector = (
    scene:Scene, 
    v1 : Vector3, 
    v2 : Vector3, 
    color:number,    
    speed:number, 
    scale:number, 
    materialType:materialType 
) => {
    let crossAction = crossProductAction(
        scene,v1,v2,color,speed,scale,materialType
    );  
    let added = false;

    let v11 = Vector(scale, new Vector3(0,0,0), new Vector3(v1.x,v1.y,v1.z), materialType, color);
    let v22 = Vector(scale, new Vector3(0,0,0), new Vector3(v2.x,v2.y,v2.z), materialType, color);

     
    let fadeinAction = animateFadeInAction([v11.mesh,v22.mesh]); 

    let fadinController = animationHOF(speed, fadeinAction);

    let crossController = animationHOF(speed, crossAction);

 
    return animationHOFchain(
                [fadinController,crossController],
                speed, 
                () => {
                    if(!added){
                        scene.add(v11.mesh);
                        scene.add(v22.mesh);
                        added=true; 
                    }; 
                }
            );
}; 
 

export let resolveAndPassValue = (arrayOfFunctionsReturningPromises, initialValue) : Promise<any> => {
    return new Promise(
        resolve => {
            arrayOfFunctionsReturningPromises
            .reduce( 
                (observable,v) => {
                    return observable.flatMap(v)
                },
                Observable.fromPromise( 
                    new Promise(
                        resolve => resolve(initialValue)
                    )
                )
            )  
            .subscribe(
                (result) => {
                    resolve(result)
                }
            )
        }
    );
}; 





export let generateDashedAngle = (v1 : Vector3, v2 : Vector3, materialType:materialType, color:number=0x00ff00) : Line => {
    
        let v1normalized = new Vector3(v1.x, v1.y, v1.z).normalize();
    
        let v2normalized = new Vector3(v2.x, v2.y, v2.z).normalize();
             
        let cosOfAngle : number = v1normalized.dot(v2normalized);
        cosOfAngle = Math.round(cosOfAngle*100000)/100000;   
               
        let angle = Math.acos(cosOfAngle); 
    
        let vectorLength = v1.length() > v2.length() ? v2.length() : v1.length();
        
        let points = [];  
        
        let geometry = new Geometry(); 
    
        for(let i=0.001; i<=angle; i+=0.001){
            points.push( 
                rotateVectorInsideSubspace(
                    v1, v2,
                    vectorLength/2,
                    -i
                )  
            ) 
        };
    
        addIndex(map)(
          (v : Vector3, idx : number) => { 
             geometry.vertices[idx]=v; 
        })(points);
    
        geometry.computeLineDistances(); 
    
        let lineMaterial = new LineDashedMaterial({color, dashSize: 0.2, gapSize: 0.2, linewidth: 3}); 
          
        let line = new Line(geometry,lineMaterial);  
    
        /*let geo = new Geometry(); 
        points.push(new Vector3(0,0,0)); 
        addIndex(map)(
            (v : Vector3, idx : number) => { 
               geo.vertices[idx]=v; 
        })(points); 
    
        let triangles = ShapeUtils.triangulateShape( points, [] );
        
        for( var i = 0; i < triangles.length; i++ )
            geo.faces.push( new Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
        
        geo.computeVertexNormals();
        geo.verticesNeedUpdate = true; 
    
        let material = getMaterial(materialType,color); 
         
        let m = new Mesh(geo,material);
        
        let r = m.clone();*/ 
    
        return line; //makeMeshTransparent(m,0.5); 
};





let generateTransparentAngle = (v1 : Vector3, v2 : Vector3, materialType:materialType, color:number=0x00ff00) : Mesh => {
   
    let v1normalized = new Vector3(v1.x,v1.y,v1.z).normalize();
    let v2normalized = new Vector3(v2.x,v2.y,v2.z).normalize();
      
    let cosOfAngle : number = v1normalized.dot(v2normalized);
    cosOfAngle = Math.round(cosOfAngle*100000)/100000;   
           
    let angle = Math.acos(cosOfAngle); 
    
    let roundedAngle = Math.round(angle*10000)/10000;
    
    if(roundedAngle===0)
       return new Mesh(); 

    let vectorLength = v1.length() > v2.length() ? v2.length() : v1.length();
    
    let points = [];  
    
    //let geometry = new Geometry(); 

    for(let i=0.001; i<=angle; i+=0.001){
        points.push( 
            rotateVectorInsideSubspace(
                v1, v2,
                vectorLength/2,
                -i
            )  
        ) 
    };

    /*
    addIndex(map)(
      (v : Vector3, idx : number) => { 
         geometry.vertices[idx]=v; 
    })(points);

    geometry.computeLineDistances(); 

    let lineMaterial = new LineDashedMaterial( { color : color, dashSize: 0.2, gapSize: 0.2, linewidth: 3 } ); 
     
    let line = new Line(geometry,lineMaterial);  
    */

    let geo = new Geometry(); 
    points.push(new Vector3(0,0,0)); 
    addIndex(map)(
        (v : Vector3, idx : number) => { 
           geo.vertices[idx]=v; 
    })(points); 

    let triangles = ShapeUtils.triangulateShape( points, [] );
    
    for( var i = 0; i < triangles.length; i++ )
        geo.faces.push( new Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
    
    geo.computeVertexNormals();
    geo.verticesNeedUpdate = true; 

    let material = getMaterial(materialType,color); 
     
    let m = new Mesh(geo,material);
    
    //let r = m.clone();

    return makeMeshTransparent(m,0.5); 
};  


 
export let resolvePromisesSequentially = ( 
    arrayOfFunctionsReturningPromises, 
    onNext : (v:any) => void,
    onError : (e:any) => void, 
    onEnd : () => void,
    scene  
) : Subscription =>   
    Observable.from(arrayOfFunctionsReturningPromises)
    .map(  
        (v:() => PromiseLike<any>) => {
           return Observable.defer(v);
        }  
    ) 
    .concatAll()
    .map((meshes) => {
        return meshes;    
    })
    .subscribe( 
        onNext,
        onError,
        onEnd
    );  
     


export let rotateVectorInsideSubspace = (
    v1 : Vector3, 
    v2 : Vector3, 
    vectorLength : number, 
    angle : number   
) : Vector3 => {
      
    let v1Zero = v1.x===0 && v1.y===0 && v1.z===0;
    let v2Zero = v2.x===0 && v2.y===0 && v2.z===0; 
    
    if(v1Zero || v2Zero) 
       return new Vector3(0,0,0); 
        
    let m = generateOrthonormalBasis(v1,v2); 
    
    let mTransposed = m.clone().transpose();
    
    let x = new Vector3()
            .fromArray([
                mTransposed.elements[0],
                mTransposed.elements[4],
                mTransposed.elements[8]
            ]);  
        
    let a = new Vector3(v1.x,v1.y,v1.z)
            .normalize() 
            .dot( 
                x.clone().normalize() 
            );

    a = Math.round(a*1000)/1000;
    
    let aRad = Math.acos(a);
    
    if(Math.round(aRad)!=0)   
        throw new Error(
            "Something wrong. Angle between X and V1 should be zero, got " +
                aRad + " angle instead for " + a + " cos"
        );
    

    let target = new Vector3(vectorLength,0,0);   

    let rotationMatrix = new Matrix4().makeRotationY(angle);

    target.applyMatrix4(rotationMatrix);
    
    target.applyMatrix4(m);   

    return target;
};    