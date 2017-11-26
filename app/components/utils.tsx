import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, addIndex, range, merge, isEmpty, curry, cond, prop,
    compose, contains, and, find, defaultTo, split, filter, take, drop, splitAt,
    ifElse, join, all, isNil, clone, is, equals   
} from 'ramda';
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
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import Pause from 'material-ui/svg-icons/av/pause-circle-outline';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Face from 'material-ui/svg-icons/social/sentiment-very-satisfied'; 
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import  MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux"; 
import { Matrix3, Vector3 } from "three";

 
export let isOperator = (item) => typeof item === "string";

export let isScalar = (item) => typeof item === "number";

export let isVector = (item) => {
    if(isNil(item))
       return false;

    return !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z);
};
 
export let isMatrix = (item:Matrix3) => {
    if(isNil(item))
       return false;

    return ifElse(
        (elements:number[]) => isEmpty(elements) || isNil(elements),
        () => false, 
        (elements:number[]) => all((el:number) => !isNaN(el))(elements) && elements.length===9
    )(item.elements);  
};


 

export let isVariable = (item) => isScalar(item) || isVector(item) || isMatrix(item);
export let isPlus = (item) => item == "plus";
export let isMinus = (item) => item == "minus";
export let isDot = (item) => item == "dot";
export let isMultiply = (item) => item == "multiply";
export let isCross = (item) => item == "cross"; 
 
 
export let caseTwo = (object,operator) : any => 
    ifElse( 
        ([object,operator]) => isVariable(object) && isOperator(operator),
        ([object,operator]) =>
                merge(
                    cond([   
                        [ ([object,operator]) => isMatrix(object),
                            () => ({matrix: isPlus(operator) || isMinus(operator) || isDot(operator),      
                                    vector: isDot(operator),   
                                    scalar: isMultiply(operator)})   
                        ], 
                        [ ([object,operator]) => isVector(object), 
                            () => ({matrix: isDot(operator),  
                                    vector: isPlus(operator)||isMinus(operator)||isDot(operator)||isCross(operator),
                                    scalar: isMultiply(operator)})   

                        ],    
                        [ ([object,operator]) => isScalar(object),
                            () => ({matrix: isMultiply(operator),   
                                    vector: isMultiply(operator), 
                                    scalar: isPlus(operator)||isMinus(operator)||isMultiply(operator)})    
                        ],
                        [() => true, () => { throw new Error("caseTwo : Input value does not match any type.") }]  
                    ])([object,operator])
                )({  
                    set:true, 
                    plus:false,
                    minus:false, 
                    dot:false, 
                    multiply:false,
                    cross:false
                }),   
        ([object,operator]) => { 
            throw new Error("caseTwo : Input values have invalid types.")
        }
    )([object,operator]);

 
let caseOne = (item) => 
    merge(
        cond([ 
            [(i) => isMatrix(i), () => ({plus:true,
                                        minus:true, 
                                        dot:true,
                                        multiply:true,
                                        cross:false})  
            ], 
            [(i) => isVector(i), () => ({plus:true,
                                        minus:true, 
                                        dot:true,
                                        multiply:true,
                                        cross:true})  
            ], 
            [(i) => isScalar(i), () => ({plus:true,
                                        minus:true, 
                                        dot:false,
                                        multiply:true,
                                        cross:false})   
            ],  
            [() => true, () => { throw new Error("caseOne : Input value does not match any type.") }]  
        ])(item),   
        { 
            matrix: false, vector: false, scalar: false, set:false 
        } 
    );
 
const caseZero = {
    matrix: true,  
    vector: true,
    scalar: true,  
    set:true, 
    plus:false,
    minus:false, 
    dot:false,
    multiply:false,
    cross:false
};  
 
export let selectEnabledActions = (input) : any => 
    ifElse( 
        is(Array),   
        cond([   
            [ compose(equals(0),prop("length")), (input) => caseZero ],    
            [ compose(equals(1),prop("length")), (input) => caseOne(input[0]) ],
            [ compose(equals(2),prop("length")), (input) => caseTwo(input[0],input[1]) ] 
        ]) as any,
        () => {
            throw new Error("selectEnabledActions : Supplied entity is not an array.")
        }
    )(input);  



export let reconstructMatrix = (M:any) => new Matrix3().fromArray(  M.elements.map( v => Math.round(v*100000)/100000 )  );
export let reconstructVector = (V:any) => new Vector3().fromArray( [V.x,V.y,V.z].map( v => Math.round(v*100000)/100000 ) );
 
 
let addMatrices = (left,right) : Matrix3 => {
    let matrix1 = reconstructMatrix(left);
    let matrix2 = reconstructMatrix(right);
    let array1 = matrix1.toArray(); 
    let array2 = matrix2.toArray();

    let x1 = array1[0]+array2[0];  let y1 = array1[1]+array2[1];  let z1 = array1[2]+array2[2];
    let x2 = array1[3]+array2[3];  let y2 = array1[4]+array2[4];  let z2 = array1[5]+array2[5];
    let x3 = array1[6]+array2[6];  let y3 = array1[7]+array2[7];  let z3 = array1[8]+array2[8];
         
    return new Matrix3().fromArray([x1,y1,z1,x2,y2,z2,x3,y3,z3]);
};  

 
let addVectors = (left,right) : Vector3 => {
    let v1 = reconstructVector(left);
    let v2 = reconstructVector(right);
    
    return new Vector3().fromArray([v1.x+v2.x, v1.y+v2.y, v1.z+v2.z]); 
};
 
let addScalars = (left,right) : number => left+right;
      
      
let subtractMatrices = (left,right) => {
    let matrix1 = reconstructMatrix(left);
    let matrix2 = reconstructMatrix(right);
    let array1 = matrix1.toArray(); 
    let array2 = matrix2.toArray(); 

    let x1 = array1[0]-array2[0];  let y1 = array1[1]-array2[1];  let z1 = array1[2]-array2[2];
    let x2 = array1[3]-array2[3];  let y2 = array1[4]-array2[4];  let z2 = array1[5]-array2[5];
    let x3 = array1[6]-array2[6];  let y3 = array1[7]-array2[7];  let z3 = array1[8]-array2[8];
         
    return new Matrix3().fromArray([x1,y1,z1,x2,y2,z2,x3,y3,z3]);
};

let subtractVectors = (left,right) => {
    let v1 = reconstructVector(left);
    let v2 = reconstructVector(right); 
    
    return new Vector3().fromArray([v1.x-v2.x, v1.y-v2.y, v1.z-v2.z]); 
};

let subtractScalars = (left,right) => left - right; 


let matrixTimesVector = (matrix,vector) : Vector3 => {
    let array = reconstructMatrix(matrix).toArray();
    let v = reconstructVector(vector);
 
    let x1 = array[0];   let y1 = array[1]; let z1 = array[2];
    let x2 = array[3];   let y2 = array[4]; let z2 = array[5];
    let x3 = array[6];   let y3 = array[7]; let z3 = array[8];
    
    let result = new Vector3();
    result.x = x1*v.x + y1*v.y + z1*v.z; 
    result.y = x2*v.x + y2*v.y + z2*v.z; 
    result.z = x3*v.x + y3*v.y + z3*v.z; 
          
    return result;  
};      
 

  
let vectorTimesMatrix = (vector, matrix) : Vector3 => 
                        reconstructVector(vector).applyMatrix3(reconstructMatrix(matrix));
  

let vectorTimesVector = (vector1, vector2) : number => 
                        reconstructVector(vector1).dot(reconstructVector(vector2));
   

let matrixTimesMatrix = (matrix1, matrix2) : Matrix3 => {
    let left : any =  reconstructMatrix(matrix1).transpose();
    let result = left.multiply(reconstructMatrix(matrix2).transpose());

    return result.transpose(); 
};   

export let projectOnVector = function ( vector : Vector3, on : Vector3 ) {
    
    var scalar = on.dot( vector ) / on.lengthSq();
 
    return vector.copy( on ).multiplyScalar( scalar );

}; 
  
export let getRandomRule = () : string => {
    let number = Math.round(Math.random()*8);
    
    switch(number){
        case 1: 
            return " Commutative: x + y = y + x "
        case 2:    
            return " Associative: x + (y + z) = (x + y) + z "
        case 3:    
            return " Unique zero vector: x + 0 = x. For all x. "
        case 4:    
            return " For each x exists unique vector -x, such that x + (-x) = 0. "
        case 5:    
            return " 1x = x "
        case 6:
            return " (C₁C₂)x = C₁(C₂x) "
        case 7:    
            return " C(x + y) = Cx + Cy "
        case 8:    
            return " (C₁+C₂)x = C₁x + C₂x"
        default: 
            return " Commutative: x + y = y + x "      
    };
};


export let squeezeCurrentResult = (input) : number | Matrix3 | Vector3 => {
    if(input.length!==3)
       return undefined;
     
    if(input.length>3)
       throw new Error("In performOperation : Input array contains more than 3 elements.");  

    if( !isOperator(input[1]) || !isVariable(input[0])  || !isVariable(input[2]) ) 
       throw new Error("In performOperation : Input values have invalid types.");
             
    let operation = input[1];
    let left = input[0]; 
    let right = input[2];
    let notDefined = () => { throw new Error("In performOperation : Operation is not defined.") };

    switch(operation){ 
        case "plus":
            return cond([ 
                [([left,right]) => isMatrix(left) && isMatrix(right), () => addMatrices(left,right)],
                [([left,right]) => isVector(left) && isVector(right), () => addVectors(left,right)],
                [([left,right]) => isScalar(left) && isScalar(right), () => addScalars(left,right)],
                [() => true, notDefined]
            ])([left,right]);  
        case "minus": 
            return cond([ 
                [([left,right]) => isMatrix(left) && isMatrix(right), () => subtractMatrices(left,right)],
                [([left,right]) => isVector(left) && isVector(right), () => subtractVectors(left,right)],
                [([left,right]) => isScalar(left) && isScalar(right), () => subtractScalars(left,right)],
                [() => true, notDefined]
            ])([left,right]);           
        case "dot":
            return cond([  
                [([left,right]) => isMatrix(left) && isVector(right), () => matrixTimesVector(left,right)],
                [([left,right]) => isVector(left) && isMatrix(right), () => vectorTimesMatrix(left,right)],
                [([left,right]) => isVector(left) && isVector(right), () => vectorTimesVector(left,right)],
                [([left,right]) => isMatrix(left) && isMatrix(right), () => matrixTimesMatrix(left,right)], 
                [() => true, notDefined]  
            ])([left,right]);  
        case "multiply":  
            return cond([
                [([left,right]) => isScalar(left) && isScalar(right), () => left * right],
                [([left,right]) => isScalar(left) && isVector(right), () => reconstructVector(right).multiplyScalar(left)],
                [([left,right]) => isScalar(left) && isMatrix(right), () => reconstructMatrix(right).multiplyScalar(left)],
                [([left,right]) => isScalar(right) && isVector(left), () => reconstructVector(left).multiplyScalar(right)],
                [([left,right]) => isScalar(right) && isMatrix(left), () => reconstructMatrix(left).multiplyScalar(right)], 
                [() => true, notDefined] 
            ])([left,right]);    
        case "cross":  
            return cond([     
                    [ 
                        ([left,right]) => isVector(left) && isVector(right), 
                        () => new Vector3().crossVectors(reconstructVector(left),reconstructVector(right))
                    ], 
                    [() => true, notDefined] 
            ])([left,right]);   
    }; 
};  


  
export let attachDispatchToProps = (dispatch,props) => merge({dispatch},props); 

export let setInput = ( 
        props, 
        setMatrixInput,
        setVectorInput,
        setScalarInput,
        val:number
) : void => {
    let newValue;
    let input=String(val);
    switch(props.type){ 
        case "Matrix3":  
            newValue = props.matrixInput;
            newValue[props.selectedId]=input; 
            setMatrixInput(newValue);    
            break;     
        case "Vector3":
            newValue = props.vectorInput;
            newValue[props.selectedId]=input; 
            setVectorInput(newValue);
            break;  
        case "number":
            newValue=props.scalarInput;
            newValue=input;
            setScalarInput(newValue); 
            break;    
    };      
};   
   

export let cutDigits = (value:string) : string => 
                compose(  
                    ifElse(
                        (s) =>  contains(".", s),     
                        (s) =>  compose(   
                                    ifElse(  
                                        (l) => l[1].length>4,
                                        (l) => join(".")([l[0],splitAt(5,l[1])[0]]), 
                                        join(".")   
                                    ),
                                    split(".")
                               )(s),   
                        (s) => String(s)
                    )
                )(value); 

export const muiTheme = getMuiTheme({ 
    spacing: spacing,  
    fontFamily: 'Roboto, serif',  
    palette: {  
        primary1Color: cyan500, 
        primary2Color: cyan700, 
        primary3Color: grey400,
        accent1Color: pinkA200,
        accent2Color: grey100,
        accent3Color: grey500,
        textColor: cyan700, 
        alternateTextColor: white,
        canvasColor: white,    
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack, 
    }
});  
 
      
export let wrapMuiThemeDark = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        {component} 
    </MuiThemeProvider>;  
  
 
export let wrapMuiThemeLight = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        {component} 
    </MuiThemeProvider>;     


export let wrapCustomMuiTheme = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={muiTheme}>  
        {component} 
    </MuiThemeProvider>;  




