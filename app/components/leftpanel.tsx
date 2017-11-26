import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, addIndex, range, merge, isEmpty, curry, isNil, cond, compose, contains, mergeAll, sum, 
    and, clone, assocPath, equals, find, splitEvery, flatten, defaultTo, split, filter, take, drop } from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {
  cyan500, cyan700,   
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'; 
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton';
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import AutoComplete from 'material-ui/AutoComplete';
import '../assets/styles.css';     
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import Divider from 'material-ui/Divider'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Settings from 'material-ui/svg-icons/action/settings';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import FontIcon from 'material-ui/FontIcon';
import Play from 'material-ui/svg-icons/av/play-circle-outline';
import Pause from 'material-ui/svg-icons/av/pause-circle-outline';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Face from 'material-ui/svg-icons/social/sentiment-very-satisfied'; 
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
const MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react"; 
import { InputActions, inputReducer } from "./input"; 
import { Matrix3, Vector3 } from "three";
import { wrapMuiThemeDark, attachDispatchToProps, muiTheme, getRandomRule, isMatrix } from "./utils";
import { topMenu } from "./toolBar";
import { Footer, Advertisement } from "./footer";
import { mathJaxMatrix, mathJaxVector, mathJaxNotExist } from "./mathJax";
import Popover from 'material-ui/Popover/Popover';
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import { InputChain } from "./inputChain";
import { VectorSpace } from "../3d/vectorSpace";
import { Animation } from "./animation";
import { unmountComponentAtNode } from "react-dom";
import { Detector } from "./detector";
import { matrixRank } from "../3d/rref";
import { getNullspace } from "../3d/nullspace";
let uniqid = require('uniqid'); 
const {
    Matrix,
    inverse,
    solve, 
    EigenvalueDecomposition 
} = require('ml-matrix');
  
 
export let Matrix3To2DArray = (m:Matrix3) : number[][] => {

    if(isNil(m))
        return [[1,0,0],[0,1,0],[0,0,1]];
     

    if(!isMatrix(m))
        throw new Error("Input value is not matrix. Matrix3ToMLMatrix. m.");

    let inArrayFrom : number[] = [];
    
    for(let i=0; i<m.elements.length; i++)
        inArrayFrom.push(m.elements[i]);
    
    let splitted = splitEvery(3)(inArrayFrom);
    
    if(
        splitted.length!=3 || 
        splitted[0].length!=3 || 
        splitted[1].length!=3 || 
        splitted[2].length!=3
    ){
        throw new Error("Incorrect array size. Matrix3ToMLMatrix. splitted.");  
    };
 
    return splitted;   
};  


export let Matrix3ToMLMatrix = (m:Matrix3) : any =>  new Matrix(Matrix3To2DArray(m)); 


export let computeEigenvalues = (m:Matrix3) : number[] => {

    let M = Matrix3ToMLMatrix(m);
   
    let eigen = new EigenvalueDecomposition(M); 

    let eigenvalues = eigen.realEigenvalues;
 
    if(eigenvalues.length!=3)
       throw new Error("computeEigenvalues : Less then 3 eigenvalues");  
 
    return eigenvalues;  
     
};


export let computeDeterminant = (m:Matrix3) : number => {

    let m1 = new Matrix3().fromArray([
        m.elements[0],m.elements[1],m.elements[2],
        m.elements[3],m.elements[4],m.elements[5],
        m.elements[6],m.elements[7],m.elements[8]
    ]); 
 
    let M = Matrix3ToMLMatrix(m); 

    let det =  M.det(); 

    let nullspace = getNullspace(
        Matrix3To2DArray(m1) 
    );

    if( compose(equals(0),sum,flatten)(nullspace) )
        return det;
    else  
        return 0; 
};
      

export let computeInverse = (m:Matrix3) : Matrix3 => {
    let inverse;

    let det = computeDeterminant(m);
    
    if(det===0)
       return undefined;  

    try{
        inverse = new Matrix3().getInverse(m,true); 
        return inverse; 
    }catch(e){
        return undefined;  
    };  
};  
 

interface leftPanelProps{
    matrix:Matrix3,
    rank:number,   
    inverse:Matrix3,  
    determinant:number, 
    eigenvalues:string[], 
    det:true,  
    eig:true,
    inv:true  
}; 

export let deriveLeftPanelPropsFromMatrix = (m:Matrix3) : leftPanelProps => {
    if(isNil(m))
      return {  
        matrix:new Matrix3().identity(),
        rank:3,  
        inverse:computeInverse(new Matrix3().identity()),  
        determinant:computeDeterminant(new Matrix3().identity()),
        eigenvalues:computeEigenvalues(
            new Matrix3().identity()).map(
                (v,idx:number) => {
                   switch(idx){
                       case 0:
                        return "𝝀₁ = " + v.toFixed(1)
                       case 1:
                        return "𝝀₂ = " + v.toFixed(1)
                       case 2:
                        return "𝝀₃ = " + v.toFixed(1)
                       default:
                        return "𝝀 = " + v.toFixed(1)  
                   }
                } 
            ),  
        det:true,  
        eig:true,
        inv:true      
      };    
     
     
    if(!isMatrix(m))
        throw new Error("Input value is not Matrix3");

    let matrix = m; 
    let inverse = computeInverse(matrix);
    let eigenvalues = computeEigenvalues(m);
    let determinant = computeDeterminant(m);
        
    let rank = matrixRank(Matrix3To2DArray(m));   

    return {     
        matrix:m,  
        rank:rank,

        inverse:inverse,  
        determinant:determinant,
        eigenvalues:computeEigenvalues(
         //   new Matrix3().identity()
         m
        ).map(
                (v,idx:number) => {
                   switch(idx){
                       case 0:
                        return "𝝀₁ = " + v.toFixed(1)
                       case 1:
                        return "𝝀₂ = " + v.toFixed(1)
                       case 2:
                        return "𝝀₃ = " + v.toFixed(1)
                       default:
                        return "𝝀 = " + v.toFixed(1)  
                   }
                } 
            ),   
        det:true,   
        eig:true,  
        inv:inverse ? true : false    as any 
    };  
};   
 
  
let storeToLeftPanelProps = (store,props) => merge(
    store.vectorSpaceReducer,
    deriveLeftPanelPropsFromMatrix(store.inputReducer.currentMatrix)
);
    

let wrapMathJaxContext = (children:JSX.Element[]) : JSX.Element => 
<MathJax.Context>
  <div style={{display:"flex"}}>  
   {children} 
  </div> 
</MathJax.Context>;

    
@connect(storeToLeftPanelProps, attachDispatchToProps)
export class LeftPanel extends Component<any,any>{
       
     constructor(props){
         super(props);  
     };    
   
     render(){
         return <div style={{
            width: "90%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}> 
               <MathJax.Context>
                <div style={{
                    display:"flex", justifyContent:"center", flexDirection:"column",
                    alignItems:"center", color:"cornsilk"  
                    }}> 
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <p style={{textAlign:"center", fontFamily: "monospace"}}>Matrix</p>  
                            
                            {mathJaxMatrix(this.props.matrix,3)}
                        
                        </div> 
                        <div style={{display:"flex", flexDirection:"column"}}> 
                            <p style={{textAlign:"center", fontFamily: "monospace"}}>Inverse</p>   
                            { this.props.inverse ? mathJaxMatrix(this.props.inverse,3) : mathJaxNotExist(null)}
                        </div> 
                </div>   
               </MathJax.Context>  
                
               <div
                 style={{
                     justifyContent: "center",
                     alignItems:"center",   
                     display: "flex",
                     flexDirection: "column",
                     fontFamily: "monospace",
                     fontSize: "larger" 
                 }}
               > 
                 <p
                  style={{
                     justifyContent: "center",
                     display: "flex",
                     fontWeight:"bold" as any, 
                     textAlign: "center",
                     color: "gold",
                     width:"100%"
                  }}
                 >
                     Rank = {Math.round(this.props.rank)}
                 </p>
  
                 <p style={{ 
                     justifyContent: "center",
                     display: "flex", 
                     fontWeight:"bold" as any, 
                     textAlign: "center",
                     color: "gold",
                     width:"100%"
                 }}> 
                     Determinant = {this.props.determinant.toFixed(3)}
                 </p>
 
                 <div 
                  style={{
                     justifyContent: "center",
                     display: "flex", 
                     flexDirection:"column",
                     alignItems:"center",
                     fontWeight:"bold" as any, 
                     textAlign: "center",
                     color: "gold", 
                     width:"60%"
                  }}         
                 >
                    Eigenvalues
                    <div style={{marginTop:"10px"}}>{
                        this.props.eigenvalues[0]
                    }
                    </div>
                        <br/> 
                    <div>{
                        this.props.eigenvalues[1]
                    }
                    </div>
                        <br/>
                    <div>{
                        this.props.eigenvalues[2]
                    }
                    </div> 
                        <br/>
                 </div>
               </div>      
               
               <div style={{
                 display: "flex", 
                 justifyContent: "center"
               }}> 
   
                 <ul className={"noPadding"} 
                     style={{
                         listStyleType:"none"
                     }}
                 >     
                     <li key={uniqid()}  
                         style={{
                            display:"inline-block",
                            margin:"10px",
                            verticalAlign:"top"
                         }} 
                     >      
                         <div     
                             //className={this.props.showDet ? "inputButtonLeft" : "inputButtonDisabledLeft"} id={"det"} 
                             //style={{backgroundColor : this.props.det ? "rgb(48,48,48)" : "rgb(88,96,88)"}}
                             className={
                                 (this.props.showDet && this.props.inv) 
                                    ? 
                                 "inputButtonLeft" 
                                    :  
                                 "inputButtonDisabledLeft"
                             } id={"det"}    
                             style={{
                                 backgroundColor : this.props.inv ? "rgb(48,48,48)" : "rgb(88,96,88)", 
                                 cursor : this.props.inv ? "pointer" : "no-drop"
                             }}  
                             onClick={(event) => {  
                                 this.props.dispatch({type:"showDet"}) 
                            }}

                         >
                         <p style={{textAlign:"center", color:"white", fontFamily: "monospace"}}>det</p>
                         </div>    
                     </li>
                     <li key={uniqid()} style={{ 
                             display:"inline-block",
                             margin:"10px",
                             verticalAlign:"top"
                     }}>      
                         <div   
                             className={this.props.showEig ? "inputButtonLeft" : "inputButtonDisabledLeft"} id={"eig"} 
                             style={{backgroundColor : this.props.eig ? "rgb(48,48,48)" : "rgb(88,96,88)"}}
                             onClick={(event) => { this.props.dispatch({type:"showEig"}) }}  
                         > 
                         <p style={{textAlign:"center", color:"white", fontFamily: "monospace"}}>eig</p>
                         </div>   
                     </li> 
                     <li key={uniqid()} style={{ 
                             display:"inline-block",
                             margin:"10px",
                             verticalAlign:"top"     
                     }}>            
                         <div        
                             className={

                                 (this.props.showInv && this.props.inv) 
                                    ?  
                                 "inputButtonLeft" 
                                    :  
                                 "inputButtonDisabledLeft"

                             } id={"inv"} 
                             style={{
                                 backgroundColor : this.props.inv ? "rgb(48,48,48)" : "rgb(88,96,88)", 
                                 cursor : this.props.inv ? "pointer" : "no-drop"
                             }}     
                             onClick={(event) => { this.props.dispatch({type:"showInv"}) }}
                         >
                         <p style={{textAlign:"center", color:"white", fontFamily: "monospace"}}>inv</p>
                         </div> 
                     </li>
                 </ul>    
                 </div>  
 
         </div>;
     };
  
 };