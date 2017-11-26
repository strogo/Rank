import { Mesh, Font, TextGeometry, Box3, MeshPhongMaterial, WebGLRenderer, Vector3, Raycaster, Vector2, Intersection, 
    PerspectiveCamera, Scene, Light, Matrix4, Texture, MeshLambertMaterial, CanvasTexture, MeshBasicMaterial, 
    LineCurve3, Quaternion, Line, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments, 
    OrbitControls, Matrix3, Geometry, LineDashedMaterial, Shape, PlaneGeometry, PlaneBufferGeometry, ShapeUtils, 
    Face3, DoubleSide, MeshPhysicalMaterial } from "three";
import { Observable } from 'rxjs/Rx';
import { find, compose, multiply, reduce, maxBy, max, min, identity, map, curry, sortBy, flatten, path, mergeAll, 
    last, prepend, equals, addIndex, assocPath, cond, range, clone, merge, splitEvery, isNil, join, isEmpty, concat, filter } from 'ramda';
import { Component } from 'react';
import * as React from 'react';
import { initScene, initCamera, initRenderer, initControls, initLights } from "./threeSetup";
import { Vector, putDot, VectorMesh, getTopCenterPoint, getBottomCenterPoint, createVector, multiplyMatrices } from "./vector";
import '../assets/styles.css';     
import { Plane, PlaneSubspace, XYZPlanes } from "./plane";
import { init2dCanvasContext, putDot2d, MarkUp } from "./markUp";
import { getMousePosition, makeMeshTransparent, getElementDimensions, 
    line, animate, setupEventListeners, onResize, subscribeToResize, 
    subscribeToMouseMove, subscribeToMouseDown, textMesh, scaleVectorInstantly, getCameraOffsetFromObjects, 
    randomChainOfVectors, getMaterial, materialType, selectObject, selectVector, animateFadeOut
} from "./threeUtils";  
import Videocamera from 'material-ui/svg-icons/av/videocam';
import IconButton from 'material-ui/IconButton'; 
import { grid, generateGrid, generateMarkup } from "./grid";
import { attachDispatchToProps, projectOnVector, isOperator, isVariable, isMatrix, isVector, isScalar, squeezeCurrentResult, wrapMuiThemeDark } from "../components/utils";
import { connect } from "react-redux";
import { 
    animateAddVectors, 
    randomColor,
    animateMultiplyScalarVector,
    animateMultiplyVectorVector,
    animateAddMatrixMatrix,
    animateSubMatrixMatrix,
    animateSubVectorVector,
    animateMultiplyMatrixVector,
    animateMultiplyMatrixMatrix,
    animateMultiplyVectorMatrix,
    animateMultiplyScalarMatrix,
    animateVectorCrossVector,
    generateDashedAngle,
    dashedAngleAction, 
} from "./animation";
import { Subscription } from "rxjs/Subscription";
import { Matrix3ToMLMatrix, computeInverse, computeDeterminant, Matrix3To2DArray } from "../components/leftpanel";
import { getNullspace, getLeftNullspace } from "./nullspace";
import { AnimationController, animationHOFchain, animationHOF } from "./animationUtils";
const {
    Matrix,
    inverse,
    solve,
    EigenvalueDecomposition
} = require('ml-matrix');
let N = require("numeric");
let uniqid = require('uniqid'); 
   
export let clear = (scene) => (m) => {
    if(m.material)
       m.material.dispose(); 
    if(m.geometry)
       m.geometry.dispose();
    scene.remove(m);   
    m = undefined;    
}   

/*
animateAddMatrixMatrix, animateMultiplyMatrixMatrix, animateScaleBy, 
animateMultiplyMatrixVector, animateSubVectorVector, 
animateSubMatrixMatrix, animateMultiplyVectorMatrix, animateMultiplyVectorVector, 
animateVectorCrossVector, animateMultiplyScalarVector, animateMultiplyScalarMatrix, 
resolvePromisesSequentially, determinantVolume 
*/

let emptyController = () => ({
    start : () => emptyController(), 
    stop : () => emptyController(), 
    getData : () => [], 
    onEnd : (f) => emptyController(), 
    setNext : (f) => emptyController() 
});  
 
let storeToVectorSpaceProps = (store,props) => {
    let mergedStore = mergeAll([store.inputReducer,store.vectorSpaceReducer]);

    let newProps = merge(props)(mergedStore); 
        
    return newProps; 
}; 
 
 
   
@connect(storeToVectorSpaceProps, attachDispatchToProps)
export class VectorSpace extends Component<any,any>{

    container : HTMLElement;

    boundingBox : any;
    scene : Scene; 
    camera : PerspectiveCamera; 
    renderer : WebGLRenderer;
    controls : OrbitControls;
 
    inputChainLength:number;
    subscription:AnimationController; 
    animationChain:any[]; 
    defaultSceneLength:number; 
    
    planes:any;
    grid:any;
    scale:any; 
    lastSelected:any;   
    lastSelectedColor:any;  

    misc:any[];

    det:any;
    eig:any;
    inv:any;
    
    Nv1:Mesh;
    Nv2:Mesh;
    Nv3:Mesh; 

    animationInProgress:boolean; 

    constructor(props){  
        super(props); 
        this.state = {
            labels : []
        };  
    };     
 
    shouldComponentUpdate(nextProps){   
         if(!this.props)
            return true; 
         if(!nextProps)
            return true; 
          
         let inputWasClosed = !this.props.inputOpen;
         let inputWillBeOpened = nextProps.inputOpen;

         let inputWillBeClosed = !nextProps.inputOpen;
         let inputWasOpened = this.props.inputOpen;
          
          
         if(inputWasClosed && inputWillBeOpened)
            return true;  
         else if(inputWasOpened && inputWillBeClosed)
            return true;
         else if(inputWasOpened && inputWillBeOpened)
            return false;       
         else if(inputWasClosed && inputWillBeClosed)
            return true;   
         
    };    
    
    currentResultLabel = () => {  
        let x = this.props.currentResult[0]; 
 
        let {width,height} = getElementDimensions(this.container); 
        let text = "?";
 
        if(isMatrix(x)){

           text = ''; 
           "["+compose( 
                        join(" ; "),
                        map(join(" , ")),
                        map(map((n:Number) => n.toFixed(2))),
                        splitEvery(3)
                      )(x.elements)+"]"; 

        }else if(isVector(x)){

           text = '';
           "["+[x.x.toFixed(2), x.y.toFixed(2), x.z.toFixed(2)].join(" , ")+"]"; 

        }else if (isScalar(x)){

           text = "["+x.toFixed(2)+"]";    
            
        };
          
        return {         
            position : {x:(width*5)/100, y:(height*5)/100},      
            text,     
            color : "#4dff4d",       
            size : 40 * (width/window.innerWidth)  
        };  
    };
 
    componentDidUpdate(prevProps){  
        //if(!this.props.fullSize)
            //return;  
        if(this.props.fullSize){   
            
            this.updateSettings(prevProps); 
            this.updateDefaultObjects(prevProps); 

        }; 
            
        if(this.props.inputOpen){ 
            
             if(this.subscription)     
                this.clearScene(); 
     
        }else{       
         
            if(!this.subscription){    
                this.animateTransformations(); 
                 
                this.subscription 
                .onEnd(
                    () => {
                        this.animationInProgress=false;
                    } 
                );

                this.animationInProgress=true;  
                this.subscription.start(); 

                if(this.props.id===2){   
                    this.addRightNullspace(); 
                }else if(this.props.id===4){     
                    this.addLeftNullspace();
                };
            }; 

        };     
    }; 
       
 
    addRightNullspace = () => { 
        if(this.Nv1){
           this.Nv1.traverse(clear(this.scene));
           this.Nv1 = undefined; 
        }
        if(this.Nv2){
           this.Nv2.traverse(clear(this.scene));
           this.Nv2 = undefined;  
        }
        if(this.Nv3){ 
           this.Nv3.traverse(clear(this.scene));
           this.Nv3 = undefined;   
        } 
             
        let array2d = getNullspace(
            Matrix3To2DArray(this.props.currentMatrix)
        );       
     
        let v = (to:Vector3) => Vector(this.props.scale,new Vector3(0,0,0),to,"phong",0x489022).mesh;
         
        let v1 = v(new Vector3(array2d[0][0],array2d[0][1],array2d[0][2]));
        let v2 = v(new Vector3(array2d[1][0],array2d[1][1],array2d[1][2]));
        let v3 = v(new Vector3(array2d[2][0],array2d[2][1],array2d[2][2]));

        this.scene.add(v1);
        this.scene.add(v2);
        this.scene.add(v3);

        this.Nv1=v1; 
        this.Nv2=v2;
        this.Nv3=v3; 
    };
 
    addLeftNullspace = () => {
        if(this.Nv1){
            this.Nv1.traverse(clear(this.scene));
            this.Nv1 = undefined; 
        }
        if(this.Nv2){
            this.Nv2.traverse(clear(this.scene));
            this.Nv2 = undefined;  
        }
        if(this.Nv3){ 
            this.Nv3.traverse(clear(this.scene));
            this.Nv3 = undefined;   
        } 
          
        let array2d = getLeftNullspace(
            Matrix3To2DArray(this.props.currentMatrix)
        );       
     
        let v = (to:Vector3) => Vector(this.props.scale,new Vector3(0,0,0),to,"phong",0x489022).mesh;
        
        let v1 = v(new Vector3(array2d[0][0],array2d[0][1],array2d[0][2]));
        let v2 = v(new Vector3(array2d[1][0],array2d[1][1],array2d[1][2]));
        let v3 = v(new Vector3(array2d[2][0],array2d[2][1],array2d[2][2]));

        this.scene.add(v1);
        this.scene.add(v2);
        this.scene.add(v3);

        this.Nv1=v1; 
        this.Nv2=v2;
        this.Nv3=v3; 
    }; 

    clearScene = () => { 
        if(this.subscription)
           this.subscription.stop();  

        removeObjectsFromScene(this.scene as any,"fixed"); 

        this.subscription=null;  
        this.animationChain=null;
    };
 
    animateTransformations = () => {

        let material : materialType = this.props.quality==="low" ? "phong" : "physical";


        let mainChainMiddleware = () : void => {map( 
            (m:Mesh) => {
                m.traverse(clear(this.scene)); 
                m = undefined; 
            }
        )(
            getNotImportantFromScene(this.scene,"fixed")
        )}; 
           

        let animationChain = cond([
            [equals(1), 
             () => computeAnimationChainCA(
                 this.inputChainLength, 
                 this.props.inputChain,
                 this.scene,
                 this.props.animationSpeed,
                 this.camera,
                 this.props.scale, 
                 material 
             )
            ], //'C(A)'  
            [equals(3),  
             () => computeAnimationChainCA(
                this.inputChainLength,  
                map(transposeInputChainMatrices)(this.props.inputChain),
                this.scene,
                this.props.animationSpeed,
                this.camera,
                this.props.scale, 
                material  
             )
            ], //'C(Aᵀ)'   
            [ 
              () => true, 
              () => []
            ]    
        ])(this.props.id);
 
        this.animationChain=clone(animationChain); 
              
        let chain = animationChain.filter(identity);
     
        if(isEmpty(chain))
            this.subscription=emptyController();
        else  
            this.subscription=animationHOFchain(
                chain,   
                this.props.animationSpeed/100,    
                () => this.props.clearScene ? mainChainMiddleware() : null 
            );     
    }; 

    updateDefaultObjects = (prevProps) => {
    
        if(!this.props.currentMatrix || !prevProps) 
            return;  
          
        if(equals(prevProps,this.props))
            return;
 
               
        if(this.props.showDet){  

            let det = getDeterminantMesh(this.props.currentMatrix,this.props.scale);
        
            if(this.det){ 
               this.det.traverse(clear(this.scene));
               this.det = undefined;  
            }    
                 
            this.scene.add(det);
            this.det=det; 

        }else{
            if(this.det){ 
               this.det.traverse(clear(this.scene));
               this.det = undefined;  
            }  
        }; 


        if(this.props.showEig){

            let eig = getEigenvectorsMesh(this.props.currentMatrix,this.props.scale);

            if(this.eig){ 
               this.eig.traverse(clear(this.scene));
               this.eig = undefined;  
            }        
            
            this.scene.add(eig);
            this.eig=eig; 

        }else{
            if(this.eig){ 
               this.eig.traverse(clear(this.scene));
               this.eig = undefined;  
            }  
        };  


        if(this.props.showInv){ 

            let inv = getInverseMesh(this.props.currentMatrix,this.props.scale); 
                
            if(this.inv){ 
                this.inv.traverse(clear(this.scene));
                this.inv = undefined;  
            }  
            
            
            this.scene.add(inv);
            this.inv=inv; 

        }else{
            if(this.inv){ 
                this.inv.traverse(clear(this.scene));
                this.inv = undefined;  
            }  
        }; 

    }; 
 
      
    inputChainLengthChanges = () => {
         
        if(!this.props.inputChain)
            return false; 

        if(!this.inputChainLength)
            this.inputChainLength=0; 
           
        if(this.props.inputChain.length != this.inputChainLength){
            this.inputChainLength=this.props.inputChain.length; 
            return true; 
        }else{ 
            return false; 
        }; 
     
    };   


    componentDidMount(){ 
        this.boundingBox=this.container.getBoundingClientRect(); 
         
        this.init();  
        this.initListeners(); 
        this.initDefaultSceneObject();

        this.defaultSceneLength=this.scene.children.length; 
    };  
             
         
    updateSettings(prevProps){
        let material : materialType = this.props.quality==="low" ? "phong" : "physical";
         
        if(
            this.props.showXplane!=prevProps.showXplane || 
            this.props.showYplane!=prevProps.showYplane || 
            this.props.showZplane!=prevProps.showZplane 
        ){
                if(this.planes){ 
                    this.planes.traverse(clear(this.scene));
                    this.planes = undefined;  
                }  
                  
                this.initSupportPlanes(
                    this.props.showXplane,this.props.showYplane,this.props.showZplane,
                    this.props.supportPlanesColor, 
                    material
                );   
        };


        if(this.props.supportPlanesColor!=prevProps.supportPlanesColor){
            if(this.planes && this.props.supportPlanesColor)
               updateColor(this.props.supportPlanesColor,this.planes);
        };
 
 
        if(
            this.props.showXgrid!=prevProps.showXgrid || 
            this.props.showYgrid!=prevProps.showYgrid || 
            this.props.showZgrid!=prevProps.showZgrid 
        ){    
            if(this.grid){ 
               this.grid.traverse(clear(this.scene));
               this.grid = undefined;  
            }     
            
            this.initGrid(
                this.props.showXgrid, 
                this.props.showYgrid, 
                this.props.showZgrid,  
                this.props.gridColor,
                material
            );   
        };

         
        if(this.props.gridColor!=prevProps.gridColor){
            if(this.grid && this.props.gridColor)
               updateColor(this.props.gridColor,this.grid);
        };
  
     
        if(this.props.markUpColor!=prevProps.markUpColor){
            if(this.scale && this.props.markUpColor)   
               updateColor(this.props.markUpColor,this.scale);
        }; 
 
         
        if(
            this.props.scale!=prevProps.scale 
        ){ 
            if(this.scale){ 
                this.scale.traverse(clear(this.scene));
                this.scale = undefined;    
            }       
             
            this.initScale(this.props.scale,this.props.markUpColor); 
        }; 
 

        if(this.props.showScale!=prevProps.showScale){
           if(this.scale)     
              this.scale.traverse((mesh:Mesh) => {makeMeshTransparent(mesh,this.props.showScale ? 1:0)});
        };   
     
        if(this.props.showMarkUp!=prevProps.showMarkUp){};
    
        
        if(this.props.autorotate!=prevProps.autorotate){
            this.controls.autoRotate=this.props.autorotate; 
        };   
    
        if(this.props.animationSpeed!=prevProps.animationSpeed){};

        /*if(this.props.quality!=prevProps.quality){
            this.scene.remove(this.grid);
            this.scene.remove(this.scale);
            this.scene.remove(this.planes);  
            this.initDefaultSceneObject();
        };*/ 
 
        if(this.props.sceneBackgroundColor!=prevProps.sceneBackgroundColor){
            this.renderer.setClearColor(this.props.sceneBackgroundColor);  
        }; 
    }; 
  
    initDefaultSceneObject = () => {
        let material : materialType = this.props.quality==="low" ? "phong" : "physical";
         
        if(this.props.showXplane || this.props.showYplane || this.props.showZplane)
            this.initSupportPlanes(this.props.showXplane,this.props.showYplane,this.props.showZplane,
                 this.props.supportPlanesColor, 
                 material
            );
            
         if(this.props.showXgrid || this.props.showYgrid || this.props.showZgrid)
            this.initGrid(this.props.showXgrid, this.props.showYgrid, this.props.showZgrid,  
                this.props.gridColor,
                material
            ); 
  
         if(this.props.showScale)
            this.initScale(this.props.scale,this.props.markUpColor);   
    };

    initListeners = () => {
         
        let listeners = setupEventListeners(this.container); 

        /*subscribeToMouseDown(
            listeners.mousedown,
            this.container,    
            this.boundingBox.width,  
            this.boundingBox.height,
            () => {}, 
            (v : Vector3) => {}
        );*/ 

        if(this.props.fullSize){
           subscribeToMouseMove(  
                listeners.mousemove,
                this.container,    
                this.boundingBox.width,  
                this.boundingBox.height, 
                () => {}, 
                this.onMousemove  
           );  

           subscribeToMouseDown(  
                listeners.mousedown,
                this.container,    
                this.boundingBox.width,  
                this.boundingBox.height, 
                () => {}, 
                () => {this.camera.up = new Vector3(0,1,0);} 
            ); 
        }
  
        subscribeToResize(
            listeners.resize,
            this.container,    
            this.boundingBox.width,  
            this.boundingBox.height,
            () => {}, 
            (width,height) => {
                this.boundingBox=this.container.getBoundingClientRect(); 
                onResize(this.renderer, this.camera, width, height);
            }
        ); 
    };   
  

    initScale(scale:number,color){  
        let markup = generateMarkup(color, scale); 
        this.scene.add(markup); 
        if(markup)  
            markup.userData.type="fixed";

        this.scale=markup; 
    };    
     
     
    initGrid(x,y,z,color,material){    
        let grid = generateGrid(x,y,z,color);
        grid.children.map(
            g => {
                let lines=last(g.children);
                lines.traverse((mesh:Mesh) => {makeMeshTransparent(mesh,0.9)});
                return g;
            } 
        );
        this.scene.add(grid);
        if(grid)  
            grid.userData.type="fixed";
 
        this.grid=grid; 
    }; 
    
    
    initSupportPlanes(x,y,z,color,materialType:materialType){
        let planes = XYZPlanes(x,y,z,color,materialType);
        planes.traverse((mesh:Mesh) => {makeMeshTransparent(mesh,0.5)});
       
        this.scene.add(planes);   
        if(planes)   
            planes.userData.type="fixed"; 
  
        this.planes=planes; 
    }; 
 
    onMousemove = (v : Vector3) => {    
            let selectedVector = selectVector(v,this.camera,this.scene);
            let labels = [];  
            let { width, height } = getElementDimensions(this.container); 
            
            if(this.misc){     
               this.misc.map(
                   (m:Mesh) => {
                       m.traverse(clear(this.scene))
                       m = undefined;
                    }
               );
            }   
               

            this.misc = [];
            

            /*if(this.lastSelected && this.lastSelectedColor){
                updateColor(
                    this.lastSelectedColor.r*256*
                    this.lastSelectedColor.g*256*
                    this.lastSelectedColor.b*256, 
                    this.lastSelected
                );
                this.lastSelected = null;
                this.lastSelectedColor = null;
            };*/
     
            if(selectedVector){

               let coordinates:any = path(["object","userData","coordinates"], selectedVector);
               let vectorColor = path(["object","material","color"], selectedVector); 
               let vector : Mesh = path(["object"], selectedVector);    
 
               //this.lastSelected=vector;  
               //this.lastSelectedColor=vectorColor; 
               
               if(coordinates) 
                  labels.push({      
                    position : {x:(width*25)/100, y:(height*80)/100},      
                    text : "[ "+coordinates.join(" , ")+" ]",    
                    color : "#4dff4d",      
                    size : 50 * (width/window.innerWidth)  
                  });  
   
               if(this.animationInProgress===false && coordinates){ 
 
                   let coordsNumbers = compose(map(Number),clone)(coordinates);
                   //updateColor(0x0abb11,vector);   
                   let p1 = Vector(this.props.scale, new Vector3(0,0,0), new Vector3(coordsNumbers[0],0,0), "phong", 0xff0000,true);  
                   let p2 = Vector(this.props.scale, new Vector3(0,0,0), new Vector3(0,coordsNumbers[1],0), "phong", 0x2c3539,true);
                   let p3 = Vector(this.props.scale, new Vector3(0,0,0), new Vector3(0,0,coordsNumbers[2]), "phong", 0x006a5c,true);
                    
                   let angleGenerator1 = dashedAngleAction(
                        new Vector3(coordsNumbers[0],coordsNumbers[1],coordsNumbers[2]).multiplyScalar(this.props.scale), 
                        new Vector3(coordsNumbers[0],0,0).multiplyScalar(this.props.scale), 
                        this.scene, 2, 
                        this.camera, 0xff0000
                   );

                   let angleGenerator2 = dashedAngleAction(
                        new Vector3(coordsNumbers[0],coordsNumbers[1],coordsNumbers[2]).multiplyScalar(this.props.scale), 
                        new Vector3(0,coordsNumbers[1],0).multiplyScalar(this.props.scale), 
                        this.scene, 2, 
                        this.camera, 0xff0000
                   );
   
                   let angleGenerator3 = dashedAngleAction(
                        new Vector3(coordsNumbers[0],coordsNumbers[1],coordsNumbers[2]).multiplyScalar(this.props.scale), 
                        new Vector3(0,0,coordsNumbers[2]).multiplyScalar(this.props.scale), 
                        this.scene, 2, 
                        this.camera, 0xff0000
                   );
  
                   let d1 = angleGenerator1(1);

                   let d2 = angleGenerator2(1); 
 
                   let d3 = angleGenerator3(1);
 
                   let transparent = map(
                       (v:VectorMesh) => makeMeshTransparent(v.mesh,0.5)
                   )([p1,p2,p3]); 
   
                   this.misc.push(p1.mesh,p2.mesh,p3.mesh);       
                   this.misc.push(d1,d2,d3);
  
                   map((m:Line) => this.scene.add(m))([d1,d2,d3]);  
                   map((m:Mesh) => this.scene.add(m))(this.misc);

               };    

            }else{  
 
                /*labels.push({    
                    position : {x:(width*5)/100, y:(height*90)/100},     
                    text : `( ${(v.x/this.props.scale).toFixed(3)}, ${(v.y/this.props.scale).toFixed(3)} )`,       
                    color :  "#4dff4d",       
                    size : 35 * (width/window.innerWidth)  
                });*/  
                                        
            }; 

            this.setState({labels});    
        
    }
         
 
    init(){ 
        let {width,height} = getElementDimensions(this.container); 
        let scene : Scene = initScene();  
        this.scene = scene;
        let camera : PerspectiveCamera = initCamera(width,height);
        this.camera = camera;
        let renderer : WebGLRenderer = initRenderer(
            width,
            height,  
            scene, 
            this.props.sceneBackgroundColor,
            this.props.fullSize 
        );     
        this.renderer = renderer;
        let orbitControls = initControls(camera, this.container);    
        this.controls = orbitControls;
        let lights = initLights(1);  
        map((light:Light) => scene.add(light))(lights);
        animate(renderer,camera,this.controls,scene,() => {this.setState({})});
        this.container.appendChild(renderer.domElement);
    };      
       
              
  
    render(){   
        let { width, height } = getElementDimensions(this.container); 
         
        let spaceTypeLabel = {   
            position : {x:(width*17)/100, y:(height*17)/100},     
            text : this.props.label,    
            color : this.props.labelColor,    
            size : 70 * (width/window.innerWidth)  
        };  

        let labels = [];

        if(this.props.fullSize)
           labels.push( this.currentResultLabel() );
        else  
           labels.push( spaceTypeLabel ); 
 
  
        if(this.state.labels)
           labels = flatten( [this.state.labels,labels] ); 
              
        return <div   
                 onMouseDown={ (event) => { this.props.dispatch({type:"select", load:this.props.id}) } } 
                 style={{      
                    width:"100%", height:"100%", position:"relative",
                    border : this.props.selectedID===this.props.id && !this.props.fullSize ? "2px solid green" : "",
                    zIndex : this.props.selectedID===this.props.id && !this.props.fullSize ? 9 : 0
                 }}  
               >   
                    <div        
                      style={{width:"inherit", height:"inherit", position:"absolute"}} 
                      ref={thisNode => this.container=thisNode}
                    >    
                    </div>  
                    {
                        this.props.fullSize 
                            ?
                        wrapMuiThemeDark(       
                            <div>  
                                <div style={{position:"absolute", right:"0", top:"30px"}}>
                                        <IconButton onClick = {() => { 
                                            this.camera.position.set(50,0,0);
                                            this.camera.up = new Vector3(0,1,0);
                                            this.camera.lookAt(new Vector3(0,0,0)); 
                                        }}> 
                                            <div> 
                                                < Videocamera />
                                            </div>  
                                        </IconButton>
                                </div>

                                <div style={{position:"absolute", right:"0", top:"5px"}}>
                                        <IconButton onClick = {() => { 
                                            this.camera.position.set(0,75,0);  
                                            this.camera.up = new Vector3(1,0,0);
                                            this.camera.lookAt(new Vector3(0,0,0)); 
                                        }}>
                                            <div className={"rotate"}>
                                                < Videocamera />
                                            </div>  
                                        </IconButton>
                                </div>
                            </div>
                        )
                        :
                        null    
                    }   
                    { 
                        this.props.showMarkUp 
                            ? 
                        <MarkUp labels={labels} width={width} height={height}/> 
                            : 
                        null
                    }
               </div>;  
    }; 
};    
  

let updateColor = (color,object) => {
    if(object && color && object.traverse){

        object.traverse(
            (m:Mesh) => { 
               if(m.material)  
                  m.material['color'].set(color);  
               return m; 
            }
        ); 

    }
};
 
 
let animationForCurrentResult = (
   scene:Scene, color:number, 
   speed:number,  input:[any,any,any], 
   camera:PerspectiveCamera,
   scale:number,
   materialType:materialType 
) : AnimationController => { 
   if(input.length!==3) 
      return undefined;
      
   if(input.length>3)
      throw new Error("In performOperation : Input array contains more than 3 elements.");  

   if( !isOperator(input[1]) || !isVariable(input[0])  || !isVariable(input[2]) ) 
      throw new Error(
        `In performOperation : Input values have invalid types.
          first value : ${JSON.stringify(input[0])}
          operator : ${JSON.stringify(input[1])} 
          second value : ${JSON.stringify(input[2])}      
        ` 
      );   
        
   let adjustScale = (input,scale) => {
        if(isMatrix(input)){
            return new Matrix3()
                .fromArray( 
                    map(
                        (n:number) => n*scale
                    )(input.elements)
                );   
        }else if(isVector(input)){
            return new Vector3(
                input.x*scale,
                input.y*scale,
                input.z*scale
            );  
        }else if(isScalar(input)){
            return input*scale;     
        }else{
            throw new Error("Input has unknown type.")
        }; 
    };

            
   let operation = input[1]; 
   let left : any = //adjustScale(
       input[0]
       //,scale);   
   let right : any = //adjustScale(
       input[2]
       //,scale);
   let notDefined = () => { throw new Error("In performOperation : Operation is not defined.") };
   
 
 
   switch(operation){   
       case "plus":  
           return cond([ 
               [([left,right] : [Matrix3,Matrix3]) => isMatrix(left) && isMatrix(right), 
                ([left,right] : [Matrix3,Matrix3]) => { 
                        
                      return animateAddMatrixMatrix(
                          left,right,color,materialType,scene,scale, speed
                       ); 
                           
               }],
               [([left,right] : [Vector3,Vector3]) => isVector(left) && isVector(right), 
                ([left,right] : [Vector3,Vector3]) => {
                   let color = randomColor(); 

                   let vector1 = Vector(scale,new Vector3(0,0,0),left, materialType, color);
                   let vector2 = Vector(scale,new Vector3(0,0,0),right, materialType, color);
                   
                   return animateAddVectors(vector1,vector2,materialType,scale,scene,speed,color);
               }],
               [([left,right]) => isScalar(left) && isScalar(right), () => undefined],
               [() => true, notDefined]
           ])([left,right]);  
       case "minus": 
           return cond([ 
               [([left,right] : [Matrix3,Matrix3]) => isMatrix(left) && isMatrix(right), 
                ([left,right] : [Matrix3,Matrix3]) => {
                     
                    return animateSubMatrixMatrix(left,right,color,materialType,scene,scale, speed);
               
               }], 
               [([left,right] : [Vector3,Vector3]) => isVector(left) && isVector(right), 
                ([left,right] : [Vector3,Vector3]) => {
                     
                    let vector1 = Vector(scale,new Vector3(0,0,0),left, materialType);
                    let vector2 = Vector(scale,new Vector3(0,0,0),right, materialType);

                    return animateSubVectorVector(scene,vector1,vector2,materialType,randomColor(),speed,scale);
                     
               }],
               [([left,right]) => isScalar(left) && isScalar(right), () => undefined],
               [() => true, notDefined]
           ])([left,right]);           
       case "dot":
           return cond([  
               [([left,right] : [Matrix3,Vector3]) => isMatrix(left) && isVector(right), 
                ([left,right] : [Matrix3,Vector3]) => {
                    let c1 = randomColor();
                    let c2 = randomColor();
                    let c3 = randomColor();
  
                    return animateMultiplyMatrixVector(left, right, c1, speed, materialType, scene, scale); 
                }
               ],
               [([left,right] : [Vector3,Matrix3]) => isVector(left) && isMatrix(right), 

                ([left,right] : [Vector3,Matrix3]) => {
                   let c1 = randomColor();     
                   let c2 = randomColor();  
                   let c3 = randomColor();
 
                   return animateMultiplyVectorMatrix(left,right, c1, speed, materialType, scene, scale); 
               }], 
               [([left,right] : [Vector3,Vector3]) => isVector(left) && isVector(right), 

                ([left,right] : [Vector3,Vector3]) => {
                      
                    return animateMultiplyVectorVector(scene, left, right, 2, camera, materialType, scale ,speed, color); 

               }],

               [([left,right] : [Matrix3,Matrix3]) => isMatrix(left) && isMatrix(right), 
                ([left,right] : [Matrix3,Matrix3]) => {
                   let c1 = randomColor();
                   let c2 = randomColor();  
                   let c3 = randomColor();   

                   return animateMultiplyMatrixMatrix(left,right,[c1,c2,c3],speed,materialType,scene,scale); 

                }],   
               [() => true, notDefined]  
           ])([left,right]);  
       case "multiply":  
           return cond([
               [([left,right]) => isScalar(left) && isScalar(right), () => undefined],
               [
                ([left,right] : [number,Vector3]) => isScalar(left) && isVector(right), 
                () => { 
                    return animateMultiplyScalarVector(scene, right, left, materialType, speed, scale);
                } 
               ],
               [([left,right] : [number,Matrix3]) => isScalar(left) && isMatrix(right), 
                () => { 
                    return animateMultiplyScalarMatrix(scene, right, left, materialType, speed, scale); 
                }
               ],
               [([left,right] : [Vector3, number]) => isScalar(right) && isVector(left), 
                () => {
                   return animateMultiplyScalarVector(scene,left,right, materialType, speed, scale);
                }  
               ],
               [([left,right] : [Matrix3, number]) => isScalar(right) && isMatrix(left), 
                () => {
                   return animateMultiplyScalarMatrix(scene,left,right, materialType, speed, scale); 
                }   
               ], 
               [() => true, notDefined] 
           ])([left,right]);     
       case "cross":    
           return cond([      
                   [ 
                       ([left,right] : [Vector3,Vector3]) => isVector(left) && isVector(right), 
                       () => {  
                           return animateVectorCrossVector(scene,left,right,color,speed,scale,materialType); 
                       }
                   ],   
                   [() => true, notDefined] 
           ])([left,right]);   
        default:
           throw new Error("Unknown operation")     
   }; 
};   

    
   
export let computeAnimationChainCA = (
    lastChainLength:number,
    inputChain:any[],
    scene:Scene,  
    animationSpeed:number,
    camera:PerspectiveCamera,
    scale:number,   
    material:materialType
) : (()=> AnimationController)[] => {

    let chain : any[] = clone(inputChain);
         
    let animationChain = []; 
 
    let chainReducer = (acc:any[],value:any) => { 
        if(acc.length<3)
           acc.push(value); 
 
        if(acc.length<3){
           return acc;  
        }else if(acc.length===3){  
            let input : any[] = clone(acc); 
            let animation = animationForCurrentResult(
                scene, 
                randomColor(), 
                animationSpeed/100,  
                input as any,  
                camera,
                scale,  
                material      
            ); 
            animationChain.push(animation);
            let newResult = squeezeCurrentResult(input);
            return [newResult]; 
        }; 
    };  
    
    chain.reduce(chainReducer,[]); 
     //filter
    return animationChain;  
};

  
export let generatePlaneFromVertices = (points : Vector3[], materialType:materialType, color : number) : Mesh => {
    
    
    let geo = new Geometry(); 

    addIndex(map)((vec : Vector3, idx : number) => {
        let v = new Vector3(vec.x,vec.y,vec.z);
        geo.vertices[idx]=v.clone(); 

    })(points); 

    if(points.length===3){  
        geo.faces.push( new Face3( 0, 1, 2 ));
    }else if(points.length===4){
        geo.faces.push( new Face3( 0, 3, 2 ));
        geo.faces.push( new Face3( 2, 1, 0 ));    
    }else{ 
        throw new Error("Input array have incorrect length. 3 or 4 expected. Got "+points.length);
    };
        
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    geo.verticesNeedUpdate = true;  
      
    let material = getMaterial(materialType,color, true, true);  
    

    let shape = new Mesh(geo,material); 

    
    return shape; //makeMeshTransparent(shape,0.9);
};
  
 

export let makeParallelogramm = (
    v1:Vector3, v2:Vector3, percentage:number=100, materialType:materialType, color:number
) : Mesh => 
    generatePlaneFromVertices(
        [
            new Vector3(v2.x,v2.y,v2.z),   
            new Vector3(v1.x,v1.y,v1.z).add(new Vector3(v2.x,v2.y,v2.z)),   
            new Vector3(v1.x,v1.y,v1.z), 
            new Vector3(0,0,0) 
        ].map((v:Vector3) => v.multiplyScalar(percentage/100)),
        materialType,
        color
    );  



export let determinantVolume = (x:Vector3, y:Vector3, z:Vector3, materialType:materialType, color:number) : Mesh => {
    let volume = new Mesh();
    
    let one = makeParallelogramm(x, y,100, materialType, color);
    let two = makeParallelogramm(x, z,100, materialType, color);
    let three = makeParallelogramm(y, z,100, materialType, color);

    volume.add(one);   
    volume.add(two);       
    volume.add(three);
                     
    let top = new Matrix4().makeTranslation(y.x, y.y, y.z);

    let left = new Matrix4().makeTranslation(z.x, z.y, z.z);
 
    let right = new Matrix4().makeTranslation(x.x, x.y, x.z);
      
    let p1 = makeParallelogramm(x, y, 100, materialType, color);  
    let p2 = makeParallelogramm(x, z, 100, materialType, color);   
    let p3 = makeParallelogramm(y, z, 100, materialType, color); 
     
    p1.applyMatrix( left ); 
    p2.applyMatrix( top );   
    p3.applyMatrix( right );  
    
    volume.add(p1); 
    volume.add(p2);   
    volume.add(p3);
    
    return volume; 
};



let getDeterminantMesh = (currentMatrix:Matrix3,scale:number) : Mesh => {
    
      if(isNil(currentMatrix))
         return new Mesh();  
  
      let det = new Mesh();
       
      if(computeDeterminant(currentMatrix)!=0){
          
         det.add(
             determinantVolume(
                  new Vector3(
                      currentMatrix.elements[0],
                      currentMatrix.elements[3],
                      currentMatrix.elements[6]
                  ).multiplyScalar(scale),
                  new Vector3(
                      currentMatrix.elements[1],
                      currentMatrix.elements[4],
                      currentMatrix.elements[7]
                  ).multiplyScalar(scale),
                  new Vector3(
                      currentMatrix.elements[2],
                      currentMatrix.elements[5],
                      currentMatrix.elements[8]
                  ).multiplyScalar(scale),
                  "phong",  
                  0xff0000  
             )
         );
         
         return det;
            
      }else{
  
         return det;
           
      };
       
  };
   



  let getEigenvectorsMesh = (currentMatrix:Matrix3,scale:number) : Mesh => {
      let eig = new Mesh();  
   
      if(isNil(currentMatrix))
         return eig; 
      
      let M = Matrix3ToMLMatrix(currentMatrix);
      let eigen = new EigenvalueDecomposition(M); 
  
      let e = eigen.eigenvectorMatrix;
      
      let v = (to:Vector3) => Vector(scale,new Vector3(0,0,0),to,"phong",0xffd700,true,true).mesh;
    
      let v1 = v(new Vector3(e[0][0],e[1][0],e[2][0]));
      let v2 = v(new Vector3(e[0][1],e[1][1],e[2][1]));
      let v3 = v(new Vector3(e[0][2],e[1][2],e[2][2]));
       
      eig.add(v1);
      eig.add(v2); 
      eig.add(v3); 
       
      return eig;  
  }; 
  



  let getInverseMesh = (currentMatrix:Matrix3,scale:number) : Mesh => {
      let inverseMesh = new Mesh(); 
  
      if(isNil(currentMatrix))
          return inverseMesh;  
  
      let inverse = computeInverse(currentMatrix); 
  
      if(inverse){
          let v = (to:Vector3) => Vector(scale,new Vector3(0,0,0),to,"phong",0xf35502,true,true).mesh;
          
          inverseMesh.add(
              v(new Vector3(inverse.elements[0],inverse.elements[3],inverse.elements[6]))
          );
  
          inverseMesh.add(
              v(new Vector3(inverse.elements[1],inverse.elements[4],inverse.elements[7]))
          );
    
          inverseMesh.add(
              v(new Vector3(inverse.elements[2],inverse.elements[5],inverse.elements[8]))
          );
          
          return inverseMesh; 
      }else{
         
          return inverseMesh;  
      
      };
  
  };  
  


   
let transposeInputChainMatrices = (inputChainElement:any) : any => {
      if(isMatrix(inputChainElement)){
          let ml = Matrix3ToMLMatrix(inputChainElement);
          let transposed = ml.transpose(); 
          let entries = [transposed[0], transposed[1], transposed[2]]; 
          return new Matrix3().fromArray(flatten(entries)); 
      }else{
          return inputChainElement;
      };      
}; 
 

 
export let getNotImportantFromScene = (scene:Scene,fixedType:string) : Mesh[] => {
    let removeList = [];

    if(!isEmpty(scene.children))
        map(  
            (child:any) => {  
                if(!child)
                    return child;

                if(child.userData){ 
                    if(child.userData.type!=fixedType && !child.isDirectionalLight)
                       removeList.push(child);  
                }else{
                    removeList.push(child); 
                };  

                return child; 
            } 
        )(scene.children);

    return removeList;
};     


  
export let removeObjectsFromScene = (scene:Scene,fixedType:string) : void => {
    if(isEmpty(scene.children))
        return;
    else{
        scene.children = map((child:any) => {  
            if(!child)
                return child; 

            if(child.userData){ 
                if(child.userData.type!=fixedType && !child.isDirectionalLight){
                    child.traverse(clear(scene));
                    child = undefined;
                }
            }else{
                child.traverse(clear(scene));
                child = undefined; 
            }
                
            return child; 
        })(scene.children);

        scene.children = scene.children.filter(v => v);    
    };    
};     


export let generateOrthonormalBasis = (v1 : Vector3, v2:Vector3) : Matrix4 => {
    let basis1 = new Vector3(v1.x,v1.y,v1.z);   

    let basis2 = new Vector3(v2.x,v2.y,v2.z);

    let projected = projectOnVector(basis2.clone(),basis1.clone());
        
    basis2.sub(projected);  
        
    let basis3 = new Vector3().crossVectors(basis1,basis2);
    
    basis1.normalize();
    basis2.normalize();  
    basis3.normalize();
    
    let m = new Matrix4().fromArray([
        basis1.x,   basis3.x,   basis2.x, 0,
        basis1.y,   basis3.y,   basis2.y, 0,
        basis1.z,   basis3.z,   basis2.z, 0, 
        0,          0,          0,        1
    ]);    
        
    m.transpose();

    return m; 
};    
 
      
    







