import { Mesh, Font, TextGeometry, Box3, MeshPhongMaterial, WebGLRenderer, Vector3, Raycaster, Vector2, Intersection, 
    PerspectiveCamera, Scene, Light, Matrix4, Texture, MeshLambertMaterial, CanvasTexture, MeshBasicMaterial, 
    LineCurve3, Quaternion, Line, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments, 
    OrbitControls, Matrix3, Geometry, LineDashedMaterial, Shape, PlaneGeometry, PlaneBufferGeometry, ShapeUtils, 
    Face3, DoubleSide, MeshPhysicalMaterial } from "three";
import { Observable } from 'rxjs/Rx';
import { find, compose, multiply, reduce, maxBy, max, min, identity, map, curry, sortBy, flatten, path, mergeAll, 
    last, prepend, equals, addIndex, assocPath, cond, range, clone, merge, splitEvery } from 'ramda';
import { Component } from 'react';
import * as React from 'react';
import { initScene, initCamera, initRenderer, initControls, initLights } from "./threeSetup";
import { Vector, putDot, VectorMesh, getTopCenterPoint, getBottomCenterPoint, createVector, multiplyMatrices } from "./vector";
import '../assets/styles.css';     
import { Plane, PlaneSubspace, XYZPlanes } from "./plane";
import { init2dCanvasContext, putDot2d, MarkUp } from "./markUp";
import { getMousePosition, makeMeshTransparent, getElementDimensions, 
    line, animate, setupEventListeners, onResize, subscribeToResize, 
    subscribeToMouseMove, subscribeToMouseDown, textMesh, scaleVectorInstantly, getCameraOffsetFromObjects, randomChainOfVectors, getMaterial, materialType
} from "./threeUtils";
import { grid, generateGrid, generateMarkup } from "./grid";
import { attachDispatchToProps, projectOnVector, isOperator, isVariable, isMatrix, isVector, isScalar, squeezeCurrentResult } from "../components/utils";
import { connect } from "react-redux";
import { animateAddVectors, randomColor,
      } from "./animation";
import { Subscription } from "rxjs/Subscription";

/*  
animateAddMatrixMatrix, animateMultiplyMatrixMatrix, animateScaleBy, 
animateMultiplyMatrixVector, animateSubVectorVector, animateSubMatrixMatrix, 
animateMultiplyVectorMatrix, animateMultiplyVectorVector, animateVectorCrossVector, 
animateMultiplyScalarVector, animateMultiplyScalarMatrix
*/

let N = require("numeric");
let uniqid = require('uniqid'); 
    
 
const defaulVectorSpaceProps = {
    width:600,
    height:600, 
    showXplane:false,
    showYplane:false,
    showZplane:false,
    showXgrid:false,
    showYgrid:false, 
    showZgrid:false, 
    scale:10,
    showScale:true,
    gridColor:0xffffff,
    supportPlanesColor:0xfffff0,
    markUpColor:0xfff000,
    showMarkUp:true,  
    autorotate:false,       
    animationSpeed:8,
    quality:"low", 
    clearScene:false, 
    sceneBackgroundColor:0x000000
};   

  

const defaultVectorSpaceState = {
    selectedID : null,
    scene : null,
    showDet : false,
    showEig : false,
    showInv : false, 
    commonVectorSpaceProps : defaulVectorSpaceProps
};   
  
export let vectorSpaceReducer = (state=defaultVectorSpaceState, action) => { 
    let newState = clone(state); 
          
    return cond([    
            [      
                equals("showXplane"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showXplane"], 
                    !newState.commonVectorSpaceProps.showXplane, 
                    newState 
                )  
            ],   
            [      
                equals("showYplane"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showYplane"], 
                    !newState.commonVectorSpaceProps.showYplane, 
                    newState 
                )  
            ],  
            [      
                equals("showZplane"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showZplane"], 
                    !newState.commonVectorSpaceProps.showZplane, 
                    newState 
                )  
            ],
            [      
                equals("showXgrid"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showXgrid"], 
                    !newState.commonVectorSpaceProps.showXgrid, 
                    newState 
                )  
            ],   
            [      
                equals("showYgrid"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showYgrid"], 
                    !newState.commonVectorSpaceProps.showYgrid, 
                    newState 
                )  
            ],  
            [      
                equals("showZgrid"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showZgrid"], 
                    !newState.commonVectorSpaceProps.showZgrid, 
                    newState 
                )  
            ],   
            [      
                equals("scale"),     
                () => {
                    let scaledState = assocPath(
                    ["commonVectorSpaceProps","scale"], 
                    action.load, 
                    newState);
                    
                    return assocPath(
                        ["commonVectorSpaceProps","showScale"], 
                        true, 
                        scaledState
                    )  
                }
            ], 
            [      
                equals("showScale"),    
                () => assocPath(
                    ["commonVectorSpaceProps","showScale"], 
                    !newState.commonVectorSpaceProps.showScale, 
                    newState
                )  
            ], 
            [      
                equals("gridColor"),    
                () => assocPath(
                    ["commonVectorSpaceProps","gridColor"], 
                    action.load.hex, 
                    newState
                )  
            ], 
            [      
                equals("supportPlanesColor"),    
                () => assocPath(
                    ["commonVectorSpaceProps","supportPlanesColor"], 
                    action.load.hex, 
                    newState
                )  
            ],   
            [      
                equals("markUpColor"),    
                () => assocPath(
                    ["commonVectorSpaceProps","markUpColor"], 
                    action.load.hex, 
                    newState
                )  
            ], 
            [      
                equals("showMarkUp"),    
                () => assocPath(  
                        ["commonVectorSpaceProps","showMarkUp"], 
                        !newState.commonVectorSpaceProps.showMarkUp, 
                         newState 
                      ) 
            ],  
            [       
                equals("autorotate"),    
                () => assocPath(  
                    ["commonVectorSpaceProps","autorotate"], 
                     !newState.commonVectorSpaceProps.autorotate, 
                     newState
                ) 
            ], 
            [      
                equals("animationSpeed"),    
                () => assocPath(
                    ["commonVectorSpaceProps","animationSpeed"], 
                    action.load, 
                    newState
                )  
            ],   
            [      
                equals("quality"),    
                () => assocPath(
                    ["commonVectorSpaceProps","quality"], 
                    action.load, 
                    newState 
                ) 
            ],
            [       
                equals("sceneBackgroundColor"),   
                () => assocPath(
                    ["commonVectorSpaceProps", "sceneBackgroundColor"], 
                    action.load.hex, 
                    newState
                ) 
            ],
            [       
                equals("clearScene"),    
                () => assocPath(
                    ["commonVectorSpaceProps","clearScene"], 
                    !newState.commonVectorSpaceProps.clearScene, 
                    newState 
                )   
            ],  
            [      
                equals("select"),   
                () => {
                    let lastSelectedID = newState.selectedID;
                    return merge(newState,{selectedID:action.load,lastSelectedID});
                } 
            ],   
            [       
                equals("showDet"),    
                () => assocPath(["showDet"], !newState.showDet, newState) 
            ],
            [      
                equals("showEig"),   
                () => assocPath(["showEig"], !newState.showEig, newState) 
            ],
            [       
                equals("showInv"),    
                () => assocPath(["showInv"], !newState.showInv, newState) 
            ], 
            [ () => true, () => newState]
    ])(action.type);  
};    

