import { Mesh, Font, TextGeometry, Box3, MeshPhongMaterial, WebGLRenderer, Vector3, Raycaster, Vector2, Intersection, PerspectiveCamera, Scene, Light, Matrix4, Texture, MeshLambertMaterial, CanvasTexture, MeshBasicMaterial, LineCurve3, Quaternion, Line, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments, LineDashedMaterial, MeshPhysicalMaterial, DoubleSide } from "three";
import { Observable } from 'rxjs/Rx';
import { find, compose, multiply, reduce, maxBy, identity, map, curry, sortBy, filter, path, equals, last, cond, range } from 'ramda';
import { Component } from 'react';
import * as React from 'react'; 
import { initScene, initCamera, initRenderer, initControls, initLights } from "./threeSetup";
import { Vector, putDot, VectorMesh, getTopCenterPoint, getBottomCenterPoint } from "./vector";
import '../assets/styles.css';     
import { Plane, PlaneSubspace } from "./plane";
import { init2dCanvasContext, putDot2d } from "./markUp";
import { randomColor } from "./animation";
import { generateOrthonormalBasis } from "./vectorSpace";
 


export let getMousePosition = (container : HTMLElement, width : number, height : number, event:any) => ({
    //x :  ( (event.clientX -container.offsetLeft) / container.getBoundingClientRect().width ) * 2 - 1,
    //y :  -( (event.clientY - container.offsetTop) / container.getBoundingClientRect().height ) * 2 + 1,
    x : ( (event.pageX - container.getBoundingClientRect().left) / container.getBoundingClientRect().width ) * 2 - 1, 
    y : ( -( (event.pageY - container.getBoundingClientRect().top) / container.getBoundingClientRect().height ) * 2 + 1 ) 
});     
  
  
export let getElementDimensions = (element : HTMLElement) : {width:number, height:number} => {
    if(!element)
        return {
            width:0,
            height:0
        }; 
         
    let position = element.getBoundingClientRect();

    return { 
        width:position.width, 
        height:position.height
    }; 
};

 
export let selectObject = (objects : Mesh[], camera : PerspectiveCamera, position : Vector3) : Intersection[] => { 
    
    let raycaster = new Raycaster(); 
 
    raycaster.setFromCamera( 
        new Vector2(position.x,position.y),  
        camera 
    ); 
    
    let intersections = raycaster.intersectObjects(objects); 

    return intersections; 

};      
   

let testVectors = (
    n:number,
    materialType:materialType,
    scene:Scene,
    scale:number 
)  => {
    map(
        () => {
            let s = Math.random() < 0.5 ? -1 : 1;
            let from  = new Vector3(n*Math.random()*s,n*Math.random()*s,n*Math.random()*s);
            let to  = new Vector3(n*Math.random()*s,n*Math.random()*s,n*Math.random()*s);
            let m = Vector(scale,from,to,materialType);
            scene.add(m.mesh);   
            scene.add(putDot(to));
        }
    )(range(0,100))
}; 
 

export let getCameraOffsetFromObjects = (objects:Mesh[], factor:number) : number => 
    compose(  
        multiply(factor), 
        reduce(maxBy(identity as any),0 as any),
        map(   
            (object:Mesh) : number => object.position.distanceTo(new Vector3(0,0,0))
        ) as any
    )(objects);
    

export let makeMeshTransparent = (mesh : Mesh, opacity : number) : Mesh => {
    
        if(!mesh.material){
            console.warn("Mesh does not have material");
            return mesh;
        };
    
        if(opacity>1 || opacity<0){
            console.warn("Opacity value should be in range from 0 to 1");
            opacity = 1;
        };
         
        mesh.material.transparent=true; 
        mesh.material.opacity=opacity;
    
        return mesh;
    
};  


export let makeMeshNotTransparent = (mesh : Mesh) : Mesh => {
    
    mesh.material.transparent=false;

    mesh.material.opacity=1;
    
    return mesh;
    
};    

export interface EventObservables{
    resize : Observable<Event>,
    mousemove : Observable<Event>,
    mousedown : Observable<Event>,
    mouseup : Observable<Event>,
    dblclick : Observable<Event>,
    keydown : Observable<Event>
}; 
 
export let setupEventListeners = (container : HTMLElement) : EventObservables => {

    let resize : Observable<Event> = Observable.fromEvent(window, "resize");
        
    let mousemove : Observable<Event> = Observable.fromEvent(container, "mousemove");

    let mousedown : Observable<Event> = Observable.fromEvent(container, "mousedown");

    let mouseup : Observable<Event> = Observable.fromEvent(container, "mouseup");

    let dblclick : Observable<Event> = Observable.fromEvent(container, "dblclick");
            
    let keydown : Observable<Event> = Observable.fromEvent(document, "keydown"); 

    return { 
        resize,
        mousemove,
        mousedown,
        mouseup,
        dblclick,
        keydown
    }; 

};     


export let onResize = curry(
    (renderer : WebGLRenderer, 
     camera : PerspectiveCamera,
     width : number, 
     height : number) : void => {
        
        camera.aspect = width / height;
    
        camera.updateProjectionMatrix(); 
                
        renderer.setSize( width , height );  
    
    }
);     


export let subscribeToMouseDown = (mousedown : Observable<Event>,
    container : HTMLElement,    
    containerWidth:number,  
    containerHeight:number,
    handleError : (string) => void,   
    action : (Vector3) => void  
) => {
    mousedown    
    .map((event) => getMousePosition(container, containerWidth, containerHeight, event))              
    .subscribe(                
        (position : {
            x:number, 
            y:number
        }) => {    
            action(position);
        },      
        (err : string) => { 
            handleError(err);
        }  
    );  
}; 


let setTextureFromCanvas = (mesh : Mesh, canvas : HTMLCanvasElement) : Mesh => {
    mesh.material = new MeshBasicMaterial({ map : new CanvasTexture(canvas) });
    return mesh;
};


export let selectVector = (position,camera,scene) : Intersection => { 
    
    let raycaster = new Raycaster();
    
    raycaster.setFromCamera( 
        new Vector2(position.x,position.y),  
        camera
    );  
    
    let intersections = raycaster.intersectObjects(scene.children,true); 
    
    let intersection = filter(
        (intersect : Intersection) => 
            path(["object","userData","coordinates"], intersect)
    )(intersections ? intersections : []);

    if( intersection ){           
            
        return intersection[0];  

    };  

    return undefined;
      
};  


export let subscribeToMouseMove = ( mousemove : Observable<Event>,
    container : HTMLElement,    
    containerWidth:number,  
    containerHeight:number,
    handleError : (string) => void,   
    action : (v : Vector3) => void  
) => {   
    mousemove  
    .map(   
        (event) =>//[ 
            getMousePosition(container,  containerWidth, containerHeight, event),
            //getMousePosition(container, containerWidth, containerHeight, event2) 
        //]
    )
    .map(
        (position) => {
                    return new Vector3(position.x,position.y,0);
                }  
    )                                
    .subscribe(     
        (v : Vector3) => {    
            action(v);
        },      
        (err) => {
            handleError(err)
        }
    )
};  



export let subscribeToResize = (resize : Observable<Event>,
    container : HTMLElement,    
    containerWidth:number,  
    containerHeight:number,
    handleError : (string) => void,   
    action : (width : number, height : number) => void 
) => { 

    resize 
    .subscribe(
        (event) => {

            let width : number = container.offsetWidth;
            
            let height : number = container.offsetHeight;

            action(width, height);
            
        },
        (err) => {
            handleError(err); 
        }
    ); 
            
};        
 

let sceneOrigin = (objects : Mesh[]) : Vector3 => {  
    
    let middle_x;   
    let middle_y;   
    let middle_z;    


    let xAxis=sortBy(path<any>(['position','x']),objects); 
    let yAxis=sortBy(path<any>(['position','y']),objects);
    let zAxis=sortBy(path<any>(['position','z']),objects);  

            
    let middleX = (last(xAxis).position.x + xAxis[0].position.x)/2;
    let middleY = (last(yAxis).position.y + yAxis[0].position.y)/2;
    let middleZ = (last(zAxis).position.z + zAxis[0].position.z)/2;              

    return new Vector3(middleX,middleY,middleZ);

}; 

export type materialType = "phong" | "physical";


export let getMaterial = (materialType:materialType, color:number, disableDepthTest?, offset?) => {
    let material =  cond([
        [equals("phong"), 
         () => new MeshPhongMaterial({ 
                     color : color,
                     specular : 0x050505,
                     shininess : 50,
                     side : DoubleSide, 
                     polygonOffset : true,   
                     depthTest : true, 
                     polygonOffsetFactor : offset? Math.random() : 1,
                     polygonOffsetUnits : 0.1
                     //depthTest : true,
                     //polygonOffsetFactor : 1,
                     //polygonOffsetUnits : 0.1
                     //depthWrite:false
                     //depthTest:disableDepthTest ? false : true 
               })         
        ], 
        [equals("physical"),  
         () => new MeshPhysicalMaterial({
                     color: color,
                     metalness: 0.7,
                     roughness: 0.9,
                     clearCoat:  0.8,
                     clearCoatRoughness: 0.8,
                     reflectivity: 0.3,
                     side:DoubleSide,
                     //depthTest:disableDepthTest ? false : true
                     //envMap: ( index % 2 ) == 1 ? hdrCubeRenderTarget.texture : null
                 }) 
        ]
    ])(materialType);

    return material; 
}; 

 
export let randomChainOfVectors = (n:number,size,materialType:materialType,scale:number) : VectorMesh[] => {
    let lastX=0;
    let lastY=0;
    let lastZ=0;
    let vs = [];
      
    for(let i=0; i<n; i++){
        let n = size;  
        let signX = Math.random() > 0.5 ? -1 : 1;
        let signY = Math.random() > 0.5 ? -1 : 1;
        let signZ = Math.random() > 0.5 ? -1 : 1;

        let x = Math.random()*n*signX;
        let y = Math.random()*n*signY; 
        let z = Math.random()*n*signZ;

        let vector = Vector(scale,new Vector3(lastX,lastY,lastZ),new Vector3(x,y,z),materialType,randomColor());
        
        lastX=x;
        lastY=y;
        lastZ=z;
        
        vs.push(vector); 
    }; 
    return vs; 
};



export let randomVectors = (n:number,length:number, materialType:materialType, scale:number) : VectorMesh[] => 
    map(
        (n:number) : VectorMesh => {
            let signA = Math.random() > 0.5 ? -1 : 1;
            let signB = Math.random() > 0.5 ? -1 : 1;
            let signC = Math.random() > 0.5 ? -1 : 1;
            let signX = Math.random() > 0.5 ? -1 : 1;
            let signY = Math.random() > 0.5 ? -1 : 1;
            let signZ = Math.random() > 0.5 ? -1 : 1;

            let a = Math.random()*n*signA;
            let b = Math.random()*n*signB;
            let c = Math.random()*n*signC;
            let x = Math.random()*n*signX; 
            let y = Math.random()*n*signY;
            let z = Math.random()*n*signZ;


            let from = new Vector3().fromArray([a,b,c]);
            let to = new Vector3().fromArray([x,y,z]);
 
            let vector = Vector(scale,from,to,materialType,randomColor());
   
            return vector;
        }
    )(range(0,n)); 

 

export let replaceSceneObject = (scene:Scene, object:Mesh, withWhat:Mesh) : void => {
    scene.remove(object);
    scene.add(withWhat); 
};
 

export let line = (from : Vector3, to : Vector3, color : number) : Line => {
    
    var lineGeometry = new BufferGeometry();

    var positions = new Float32Array( 3 * 2 );  

    positions[0]=from.x;
    positions[1]=from.y;
    positions[2]=from.z;  
    
    positions[3]=to.x;
    positions[4]=to.y; 
    positions[5]=to.z; 
     
     
    lineGeometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
 
    let lineMaterial = new LineBasicMaterial( { color: color } ); 
 
    let targetLine = new LineSegments(lineGeometry, lineMaterial); 

    return targetLine;

};  


export let dashedLine = (from : Vector3, to : Vector3, color : number) : Line => {
    
    var lineGeometry = new BufferGeometry();

    var positions = new Float32Array( 3 * 2 );  

    positions[0]=from.x;
    positions[1]=from.y;
    positions[2]=from.z;  
     
    positions[3]=to.x;
    positions[4]=to.y; 
    positions[5]=to.z; 
     
    lineGeometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
  
    let lineMaterial = new LineDashedMaterial( { color: color, dashSize: 0.2, gapSize: 0.4, linewidth: 3 } );  
 
    let targetLine = new LineSegments(lineGeometry, lineMaterial); 

    return targetLine;

}; 



export let scaleVectorInstantly = (v : VectorMesh, scalar : number, materialType:materialType, scale:number,color) : VectorMesh => {
    
    let from = v.from.clone();
    let to = v.to.clone();

    let newFrom = from.clone().sub(from).multiplyScalar(scalar).add(from);
    let newTo = to.clone().sub(from).multiplyScalar(scalar).add(from);
        
    return Vector(scale,newFrom,newTo,materialType,color); 
};  
      
    
export let addVectorsMeshes = (v1 : VectorMesh , v2 : VectorMesh, materialType:materialType, scale:number) : VectorMesh => {

    let x = v1.to.clone().sub(v2.from.clone());
    
    let newV2to = v2.to.clone().add(x);

    return Vector(scale, v1.from,newV2to, materialType, randomColor());  
};  
    

export let subVectorsMeshes = (v1 : VectorMesh , v2 : VectorMesh, materialType:materialType, scale:number, color) : VectorMesh => {
      
    let newV2 = scaleVectorInstantly(v2, -1 , materialType, scale, color);
    
    return addVectorsMeshes(v1,newV2,materialType,scale);
};
 
  

export let animate = (
    renderer, 
    camera, 
    controls, 
    scene, 
    updateComponent:Function
) => { 
 
    let nextFrame = function(){  
        renderer.render(scene,camera);
        updateComponent();
        if(controls)
           controls.update(); 
        requestAnimationFrame(nextFrame);
    };   
       
    nextFrame();  
};   


 
export let textMesh = (color: number, size:number, height:number) => (text: string) : Mesh => {
    
       let material = new MeshPhongMaterial({ 
           color : color,   
           specular: 0x050505,  
           shininess: 50  
       });   
    
       let fontJson = require('../../helvetiker.typeface.json');
        
       let font = new Font(fontJson);   
   
       let geometry = new TextGeometry( 
                           text, 
                           {   font: font,
                               size: size,
                               height: height,  
                               curveSegments: 2,
                              // bevelThickness: 0, 
                              // bevelSize: 0.1, 
                              // bevelEnabled: false 
                           } 
                       );
   
       let textMesh = new Mesh(geometry,material);  

       return textMesh;       
};  
  

export let animateVectorMeshRotationInsideSubspace = (
    v1 : Vector3, v2 : Vector3, 
    vectorLength : number, materialType:materialType,
    color : number, scale:number, angle : number
) => (counter) => Mesh => {

    let m = generateOrthonormalBasis(v1,v2); 
    let mInverse = new Matrix4().getInverse(m.clone(),false);
    let vec = Vector(scale,new Vector3(0,0,0), new Vector3(vectorLength,0,0),materialType,color); 
    vec.mesh.applyMatrix(m);

    return (counter:number) => {
        vec.mesh.applyMatrix(mInverse);
        vec.mesh.applyMatrix(new Matrix4().makeRotationZ(-counter));
        vec.mesh.applyMatrix(m);
        return vec.mesh; 
    };
}; 
  
    
export let animateFadeInAction = (meshes:Mesh[]) => {

    return (counter) => {
        map(
            (mesh:Mesh) => mesh.traverse((m:Mesh) => makeMeshTransparent(m,counter))
        )(meshes); 

        return meshes; 
    };
};
       
  
export let animateFadeOut = (meshes:Mesh[]) => {

    return (counter) => {
        let transparency = (1-counter) < 0 ? 0 : (1-counter);
        
        map( 
            (mesh:Mesh) => mesh.traverse((m:Mesh) => makeMeshTransparent(m,(transparency < 0.1) ? 0 : transparency))
        )(meshes); 
 
        return meshes;
    };
};




 

