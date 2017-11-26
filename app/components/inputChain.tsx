import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import {
    map, addIndex, range, merge, equals, prop,     
    assocPath, isEmpty, curry, clone, cond, all, reduce, flatten, not,
    compose, contains, and, find, defaultTo, last, isNil, concat, 
    split, filter, take, drop, splitEvery, ifElse, identity, join, toString , none            
} from 'ramda'; 
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {   
    cyan500, cyan700, pinkA200, grey100, 
    grey300, grey400, grey500, white, 
    darkBlack, fullBlack  
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
import MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react";
import { createStore } from "redux"; 
var uniqid = require('uniqid');
import Popover from 'material-ui/Popover/Popover';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add'; 
import InputIcon from 'material-ui/svg-icons/action/input'; 
import { connect } from "react-redux";
import { Matrix3, Vector3 } from "three";
import {  
    isScalar, isVector, isMatrix, isPlus, isMinus, isDot, isMultiply, isCross, attachDispatchToProps, 
    cutDigits, setInput, squeezeCurrentResult, selectEnabledActions, isOperator } from "./utils";
import { mathJaxScalar, mathJaxMatrix, mathJaxVector, mathJaxMinus, mathJaxPlus, mathJaxDot, mathJaxCross, mathJaxMultiply, mathJaxVectorTransposed } from "./mathJax";


    
 
let valueToMathJax = (value : any) : any => 
    cond([ 
        [(v) => isNil(v), () => null],
        [(v) => isScalar(v), (v) => mathJaxScalar(v)], 
        [(v) => isVector(v), (v) => mathJaxVector(v)], 
        [(v) => isMatrix(v), (v) => mathJaxMatrix(v)], 
        [(v) => isPlus(v), (v) => mathJaxPlus(v)], 
        [(v) => isMinus(v), (v) => mathJaxMinus(v)], 
        [(v) => isDot(v), (v) => mathJaxDot(v)],  
        [(v) => isMultiply(v), (v) => mathJaxMultiply(v)],
        [(v) => isCross(v), (v) => mathJaxCross(v)] 
    ])(value);

  

let storeToinputChainProps = (store,props) => clone(store.inputReducer);  
@connect(storeToinputChainProps, attachDispatchToProps) 
export class InputChain extends Component<any,any>{
      container:Element; 

      constructor(props){
          super(props);
 
      }; 
  
      shouldComponentUpdate(nextProps,nextState){
 
            let empty = !(this.props.inputChain && nextProps.inputChain);
            let lengthChanges = !(this.props.inputChain.length===nextProps.inputChain.length);
            
            if(empty || lengthChanges)
               return true;    
            else  
               return false; 
      };   

      render(){  
          return <div style={{color:"white"}} className={"chain"}>
              {
                compose( 
                    wrapMathJaxContext,  
                    flatten, 
                    map( 
                        (value : any[]) => { 
                            
                            let leftValue = value[0];
                            let operator = value[1];
                            let rightValue = value[2];   
 
                            if(none(isNil,[leftValue,operator,rightValue])){
                                return triple(
                                    valueToMathJax(leftValue),
                                    valueToMathJax(operator),
                                    valueToMathJax(rightValue)
                                 );  
                            }else{

                                if(isNil(leftValue) && isNil(rightValue) && isNil(operator)){

                                    return [];
                                
                                }else if(!isNil(leftValue) && isNil(operator) && isNil(rightValue)){

                                    return [ 
                                        <div key={uniqid()} style={{
                                            margin:"10px", fontSize:"120%", 
                                            display:"flex", alignItems:"center"}}
                                        >{
                                            valueToMathJax(leftValue)
                                        }</div>
                                    ];
                                     
                                }else if(!isNil(leftValue) && !isNil(operator) && isNil(rightValue)){
                                    return [
                                        <div key={uniqid()} style={{
                                            margin:"10px", fontSize:"120%", 
                                            display:"flex", alignItems:"center"}}
                                        >{
                                            valueToMathJax(leftValue)
                                        }</div>,
                                        <div key={uniqid()} style={{
                                            margin:"10px", fontSize:"120%", 
                                            display:"flex", alignItems:"center"}}
                                        >{
                                            valueToMathJax(operator)
                                        }</div>
                                    ];  
                                }; 

                            }
                              
                        }     
                    ),
                    splitEvery(3)
                )(this.props.inputChain)
              } 
          </div>   
      }; 
};    

 
let wrapMathJaxContext = ( children:JSX.Element[]) : JSX.Element => 
    <MathJax.Context options = {{
        processSectionDelay: 0,
        processUpdateTime: 0,
        processUpdateDelay: 0
    }}>
      <div style={{display:"flex"}}>  
       {children} 
      </div> 
    </MathJax.Context>; 

 
let triple = (first,middle,last) : JSX.Element[] => 
    [
        <div key={uniqid()} style={{
            margin:"10px", fontSize:"120%", 
            display:"flex", alignItems:"center"}}
        >{
            first
        }</div>,
        <div key={uniqid()} style={{
            margin:"10px", fontSize:"120%", 
            display:"flex", alignItems:"center"}}
        >{
            middle 
        }</div>,
        <div key={uniqid()} style={{
            margin:"10px", fontSize:"120%", 
            display:"flex", alignItems:"center"}}
        >{
            last
        }</div>
    ];
