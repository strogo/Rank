import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, addIndex, range, merge, isEmpty, curry, cond, compose, contains, and, find, defaultTo, split, filter, take, drop } from 'ramda';
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
import MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { Matrix3, Vector3 } from "three";
import { reconstructVector, reconstructMatrix } from "./utils";



export let mathJax = (s:string, onRender?:Function) : JSX.Element => <MathJax.Node>{s}</MathJax.Node>; 

   
export let mathJaxScalar = (value) : any => mathJax( value.toFixed(5) );
 
  
export let mathJaxVectorTransposed = (value) : any => 
       compose(   
            mathJax,
            (vector:Vector3) => `\\begin{bmatrix}
                                    ${vector.x} & 
                                    ${vector.y} &   
                                    ${vector.z}  
                                \\end{bmatrix}`,
            reconstructVector
       )(value);
 
        
export let mathJaxVector = (value) : any => 
        compose(  
            mathJax, 
            (vector:Vector3) => `\\begin{bmatrix}
                                    ${vector.x} \\\\ 
                                    ${vector.y} \\\\   
                                    ${vector.z}  
                                \\end{bmatrix}`,
            reconstructVector
        )(value);       



 
export let mathJaxMatrix = (value, f?) : any => {
       let fixed = f ? f : 2;
       return compose(  
            mathJax,   
            (matrix:Matrix3) => 
              `\\begin{bmatrix}
                 ${matrix.elements[0].toFixed(fixed)} & ${matrix.elements[1].toFixed(fixed)} & ${matrix.elements[2].toFixed(fixed)} \\\\
                 ${matrix.elements[3].toFixed(fixed)} & ${matrix.elements[4].toFixed(fixed)} & ${matrix.elements[5].toFixed(fixed)} \\\\
                 ${matrix.elements[6].toFixed(fixed)} & ${matrix.elements[7].toFixed(fixed)} & ${matrix.elements[8].toFixed(fixed)} 
               \\end{bmatrix}`,  
            reconstructMatrix 
       )(value);   
}
      
 
export let mathJaxPlus = (value) => mathJax("+"); 
export let mathJaxMinus = (value) => mathJax("-");
export let mathJaxDot = (value) => mathJax("\\cdot");
export let mathJaxMultiply = (value) => mathJax("*");  
export let mathJaxCross = (value) => mathJax("\\times");
export let mathJaxNotExist = (value) => mathJax("\\nexists");



