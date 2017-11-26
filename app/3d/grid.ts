import { Mesh, Font, TextGeometry, Box3, MeshPhongMaterial, WebGLRenderer, Vector3, Raycaster, Vector2, Intersection, PerspectiveCamera, Scene, Light, Matrix4, Texture, MeshLambertMaterial, CanvasTexture, MeshBasicMaterial, LineCurve3, Quaternion, Line, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments, OrbitControls } from "three";
import { Observable } from 'rxjs/Rx';
import { find, compose, multiply, reduce, maxBy, identity, map, curry, sortBy, path, last, cond, range } from 'ramda';
import { Component } from 'react';
import * as React from 'react';
import { initScene, initCamera, initRenderer, initControls, initLights } from "./threeSetup";
import { Vector, putDot, VectorMesh, getTopCenterPoint, getBottomCenterPoint } from "./vector";
import '../assets/styles.css';     
import { Plane, PlaneSubspace } from "./plane";
import { init2dCanvasContext, putDot2d } from "./markUp";
import { getMousePosition, makeMeshTransparent, getElementDimensions, line, textMesh } from "./threeUtils";



let markToPosition = (mark:Mesh, from:number, textSize:number) : void => {
    mark.applyMatrix(new Matrix4().makeRotationX(-Math.PI/2));
    mark.applyMatrix(new Matrix4().makeRotationY(Math.PI + Math.PI/2));

    let markBoundingBox = new Box3().setFromObject(mark);   

    let min : Vector3 = markBoundingBox.min;
    let max : Vector3 = markBoundingBox.max;

    mark.position.copy(new Vector3(  
        from-textSize/2, 
        0,
        - (max.z-min.z)/2
    ));      
};  



let createMarkup = (container:Mesh, limit:number, frequency:number, textColor, textSize:number, scale:number) => {
    for(let i=-limit; i<=limit; i+=frequency){ 
        if(i!=0){ 
            let createTextMesh = textMesh(textColor, textSize, 0.0); 
            let mark = createTextMesh((i/scale).toFixed(1)); 
            markToPosition(mark, i, textSize); 
            container.add(mark);  
        };  
    }; 
};


export let scale = (showXMarkup:boolean, showZMarkup:boolean, frequency:number, textColor:number, scale:number) => {
    let object = new Object3D(); 
    let zMarkup = new Mesh();  
    let xMarkup = new Mesh();
    let textSize = frequency/2;    
    
    let limit = 50; 
 
    if(showXMarkup){
        createMarkup(xMarkup,limit,frequency,textColor,textSize,scale);   
        object.add(xMarkup);
    }; 
    
    if(showZMarkup){
        createMarkup(zMarkup,limit,frequency,textColor,textSize,scale); 
        zMarkup.applyMatrix(new Matrix4().makeRotationY(Math.PI/2 + Math.PI));
        object.add(zMarkup);
    }; 

    return object;
};


export let grid = (   
    gridColor:number, 
    frequency:number=2, 
    showXMarkup:boolean=true, 
    showZMarkup:boolean=true
) : Object3D => {
    let textSize = frequency/2;     
    let object = new Object3D(); 
    
    let limit = 50; 

   
    let lines = new Mesh();

    let addGridLine = (lines:Object3D,from,limit) : void => {
        lines.add( line( new Vector3(from,0,limit), new Vector3(from,0,-limit), gridColor ) );  
        lines.add( line( new Vector3(limit,0,from), new Vector3(-limit,0,from), gridColor ) );
    };

    for(let i=-limit; i<=limit; i+=frequency)
        addGridLine(lines,i,limit);
      

    object.add(lines); 

    return object;
}; 


export let generateMarkup = (markUpColor:number, scaleFactor:number) : Mesh => {
    let markup = new Mesh();

    let xScale = scale(false,false,2,markUpColor,scaleFactor); 
    xScale.applyMatrix(new Matrix4().makeRotationX(Math.PI/2));
    markup.add(xScale);


    let yScale = scale(true,true,2,markUpColor,scaleFactor);
    markup.add(yScale);
 

    let zScale = scale(true,false,2,markUpColor,scaleFactor);
    zScale.applyMatrix(new Matrix4().makeRotationZ(Math.PI/2)); 
    zScale.applyMatrix(new Matrix4().makeRotationY(Math.PI)); 
    markup.add(zScale); 
    
    return markup;  
};
 
 
export let generateGrid = (x:boolean,y:boolean,z:boolean, gridColor:number) : Mesh => {
    
        let gridObject = new Mesh(); 
        
        if(y){
            let yGrid = grid(gridColor, 2);
            gridObject.add(yGrid);
        };
     
        if(x){
            let xGrid = grid(gridColor, 2,false,true);  
            xGrid.applyMatrix(new Matrix4().makeRotationX(Math.PI/2));
            gridObject.add(xGrid);
        };
      
        if(z){
            let zGrid = grid(gridColor, 2,false,false);
            zGrid.applyMatrix(new Matrix4().makeRotationZ(Math.PI/2));
            gridObject.add(zGrid);
        }; 
    
    
        return gridObject;
    };
    