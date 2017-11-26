import { Vector3, WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, Group, Mesh, Line, Light, Fog, Color, LineBasicMaterial, BufferAttribute, BufferGeometry } from 'three';
import * as THREE from "three";
import {find, map} from 'ramda';  
(window as any).THREE = THREE;   
import * as TWEEN from '@tweenjs/tween.js'; 
require("three/examples/js/controls/OrbitControls");  

   
           
export let initScene = () : Scene => {
     
    let scene = new Scene();  
    
    /*let remove = scene.remove;

    scene.remove = function(m:any){
        remove.call(scene,m);

        if(m)
           if(m.isMesh){
              m.geometry.dispose(); 
              m.material.dispose();
           };  
              
        m = undefined;   
    };*/ 

    return scene; 
    
};   
   

export let initCamera = (width:number, height:number) : PerspectiveCamera => {  
 
    let camera = new PerspectiveCamera(50, width/height, 1, 2000); 
 
    camera.position.set(50,50,50);
     
    camera.lookAt(new Vector3(0,0,0)); 

    return camera; 
        
};    
      

export let initRenderer = (
    width:number, height:number, 
    scene : Scene, clearColor : number, 
    fullSize:boolean
) : WebGLRenderer => {
  
    let renderer = new WebGLRenderer( {antialias:true 
        //fullSize
    } ); 

    renderer.setSize(width, height, true);  
 
    renderer.setClearColor(clearColor); 
    
    renderer.setPixelRatio( window.devicePixelRatio );
      
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.toneMapping = THREE.Uncharted2ToneMapping;
    renderer.toneMappingExposure = 0.75;

    return renderer;  
      
};   
     
 
  
export let initControls = (camera:THREE.PerspectiveCamera, container:HTMLElement) => {
 
    let controls = new THREE.OrbitControls(camera,container);   
    controls.enablePan=false;
    controls.autoRotateSpeed = 8.0;
    return controls;    
};    
           

export let initLights = (lightIntensity:number) => {

    //let ambient = new THREE.AmbientLight(0x000000); 
    //ambient.position.set(0,0,0);     
     
    return [     
         [-50, 0, 0],
         [ 50, 0, 0], 

         [0, 50, 0],  
         [0,-50, 0],

         [0, 0,-50],  
         [0, 0, 50],
         //[-50, -50, 50],
         //[50, -50, 50],  
         //[50, -50, -50], 
         //[-50, -50, -50], 
    ].map(   
        (tuple) => {
            let light = new THREE.DirectionalLight(0xffffff, 0.3);
            light.position.set( tuple[0], tuple[1], tuple[2] ).normalize();   
            return light;
        }
    );    
       
};  
  
  
export let line = (from : Vector3, to : Vector3, color : number) : Line => {
    
    let lineGeometry = new BufferGeometry();
        
    let positions = new Float32Array( 3 * 2 );  
    
    positions[0]=from.x;
    positions[1]=from.y;
    positions[2]=from.z;  
    
    positions[3]=to.x;
    positions[4]=to.y; 
    positions[5]=to.z; 
      
    lineGeometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
 
    let lineMaterial = new LineBasicMaterial( { color: color } ); 
 
    let targetLine = new Line(lineGeometry, lineMaterial); 

    return targetLine;

};  