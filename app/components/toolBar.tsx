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
import MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux"; 
import { Matrix3, Vector3 } from "three";
var uniqid = require('uniqid'); 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { SketchPicker, GithubPicker  } from 'react-color';
 
const colors=[
    '#B80000', '#DB3E00', '#FCCB00', 
    '#008B02', '#006B76', '#1273DE', 
    '#004DCF', '#5300EB', '#EB9694', 
    '#FAD0C3', '#FEF3BD', '#C1E1C5', 
    '#BEDADC', '#C4DEF6', '#BED3F3', 
    '#D4C4FB'
];    
     

export let hideButton = () =>
    <IconButton className="no-drag" onClick={() => ipcRenderer.send("hide")}>
        <Remove/> 
    </IconButton>;  

export let closeButton = () => 
    <IconButton className="no-drag" onClick={() => ipcRenderer.send("close")}>
        <Clear/> 
    </IconButton>; 

export let refresh = () =>
    <IconButton className="no-drag" onClick={() => ipcRenderer.send("reload")}>
        <Refresh/> 
    </IconButton>;


 
export let toggleSizeButton = () : JSX.Element => 
<IconButton 
    className="no-drag" 
    onTouchTap={() => {ipcRenderer.send("size")}} 
>     
  <FullScreen />
</IconButton>;   
  

let colorPicker = (onChange:(string) => void) => 
    <div className="no-drag" 
                    style={{
                        zIndex:999, 
                        justifyContent:"center", 
                        alignItems:"center", 
                        display:"flex"
                    }}> 
        <GithubPicker  
            className="no-drag"
            width="100px"  
            colors={colors}  
            triangle={'hide'} 
            onChange={onChange}
        /> 
    </div>;

interface MenuOption{
    primaryText:string   
};  


interface CommonVectorSpaceProps{
    width:number,
    height:number, 
    showXplane:boolean,
    showYplane:boolean,
    showZplane:boolean,
    showXgrid:boolean,
    showYgrid:boolean, 
    showZgrid:boolean,
    scale:number,
    showScale:boolean,
    gridColor:number,
    supportPlanesColor:number,
    markUpColor:number,
    showMarkUp:boolean, 
    autorotate:boolean,       
    animationSpeed:number, 
    quality: "high" | "low",
    sceneBackgroundColor:number,
    clearScene:boolean 
};  


//className="no-drag" 
let leftMenu = (dispatch:Function, commonVectorSpaceProps:CommonVectorSpaceProps,appReducer) => 
    <IconMenu className="no-drag"
                touchTapCloseDelay={0}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}} 
                onItemTouchTap={(event,child) => {
                    //console.log(child)
                }}
                useLayerForClickAway={true}
                iconButtonElement={
                    <IconButton className="no-drag">
                        <Settings />
                    </IconButton>
                } 
            >

        <MenuItem
          primaryText="Scene settings"
          className="no-drag"
          //checked={true}
          rightIcon={<ArrowDropRight />}
          menuItems={[
 
            <MenuItem 
                primaryText="Scene color"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem> 
                        {colorPicker( 
                            (color) => {
                                dispatch({type:"sceneBackgroundColor",load:color})
                            }
                        )}
                    </MenuItem> 
                ]}  
            />, 

            <MenuItem 
                primaryText="Grid color"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem> 
                        {colorPicker(
                            (color) => {
                                dispatch({type:"gridColor",load:color})
                            }
                        )}
                    </MenuItem> 
                ]} 
            />, 

            <MenuItem 
                primaryText="Support planes color"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem> 
                        {colorPicker(
                            (color) => {
                                dispatch({type:"supportPlanesColor",load:color})
                            }   
                        )}
                    </MenuItem> 
                ]} 
            />, 

            <MenuItem 
                primaryText="Scale color"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem> 
                        {colorPicker(
                            (color) => {   
                                dispatch({type:"markUpColor",load:color})
                            }  
                        )}
                    </MenuItem> 
                ]} 
            />, 

            <MenuItem 
                primaryText="Show grid"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[ 
                    <MenuItem 
                        primaryText="X" 
                        checked={ commonVectorSpaceProps.showXgrid }
                        onClick={ () => {dispatch({type:"showXgrid"})} }
                    />, 
                    <MenuItem 
                        primaryText="Y" 
                        checked={ commonVectorSpaceProps.showYgrid }
                        onClick={ () => {dispatch({type:"showYgrid"})} }
                    />,
                    <MenuItem      
                        primaryText="Z" 
                        checked={ commonVectorSpaceProps.showZgrid }
                        onClick={ () => {dispatch({type:"showZgrid"})} }
                    /> 
                ]} 
            />,  

            <MenuItem 
                primaryText="Show support planes"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[ 
                    <MenuItem 
                        primaryText="X" 
                        checked={commonVectorSpaceProps.showXplane}
                        onClick={ () => {dispatch({type:"showXplane"})} }
                    />, 
                    <MenuItem 
                        primaryText="Y" 
                        checked={commonVectorSpaceProps.showYplane}
                        onClick={ () => {dispatch({type:"showYplane"})} }
                    />,
                    <MenuItem 
                        primaryText="Z"   
                        checked={commonVectorSpaceProps.showZplane}
                        onClick={ () => {dispatch({type:"showZplane"})} }
                    /> 
                ]} 
            />,            
            <MenuItem  
                primaryText="Show scale"  
                className="no-drag" 
                onClick={ () => {dispatch({type:"showScale"})} }
                checked={commonVectorSpaceProps.showScale} 
            />,

            <MenuItem   
                primaryText="Show markup" 
                className="no-drag" 
                onClick={ () => {dispatch({type:"showMarkUp"})} }
                checked={commonVectorSpaceProps.showMarkUp} 
            />,    
            
            <MenuItem  
                primaryText="Choose scale" 
                className="no-drag"  
                rightIcon={<ArrowDropRight />}
                menuItems={[  
                    <MenuItem 
                        primaryText="50" 
                        checked={commonVectorSpaceProps.scale===1}
                        onClick={ () => {dispatch({type:"scale",load:1})} }
                    />, 
                    <MenuItem 
                        primaryText="5" 
                        checked={commonVectorSpaceProps.scale===10}
                        onClick={ () => {dispatch({type:"scale",load:10})} }
                    />,
                    <MenuItem 
                        primaryText="2.5" 
                        checked={commonVectorSpaceProps.scale===20}
                        onClick={ () => {dispatch({type:"scale",load:20})} }
                    />,
                    <MenuItem 
                        primaryText="1" 
                        checked={commonVectorSpaceProps.scale===50}
                        onClick={ () => {dispatch({type:"scale",load:50})} }
                    />, 
                    <MenuItem 
                        primaryText="0.5" 
                        checked={commonVectorSpaceProps.scale===100}
                        onClick={ () => {dispatch({type:"scale",load:100})} }
                    />, 
                    /*<MenuItem 
                        primaryText="1000" 
                        checked={commonVectorSpaceProps.scale===1000}
                        onClick={ () => {dispatch({type:"scale",load:1000})} }
                    />,
                    <MenuItem 
                        primaryText="10000" 
                        checked={commonVectorSpaceProps.scale===10000}
                        onClick={ () => {dispatch({type:"scale",load:10000})} }
                    />  */ 
                ]} 
            />,  
          
            <MenuItem   
                primaryText="Animation speed" 
                className="no-drag"   
                rightIcon={<ArrowDropRight />}
                menuItems={[ 
                    <MenuItem 
                        primaryText="4" 
                        checked={commonVectorSpaceProps.animationSpeed===4}
                        onClick={ () => {dispatch({type:"animationSpeed",load:4})} }
                    />, 
                    <MenuItem 
                        primaryText="8" 
                        checked={commonVectorSpaceProps.animationSpeed===8}
                        onClick={ () => {dispatch({type:"animationSpeed",load:8})} }
                    />, 
                    <MenuItem  
                        primaryText="16" 
                        checked={commonVectorSpaceProps.animationSpeed===16}
                        onClick={ () => {dispatch({type:"animationSpeed",load:16})} }
                    />,
                    <MenuItem  
                        primaryText="25" 
                        checked={commonVectorSpaceProps.animationSpeed===26}
                        onClick={ () => {dispatch({type:"animationSpeed",load:26})} }
                    />,
                    <MenuItem  
                        primaryText="50" 
                        checked={commonVectorSpaceProps.animationSpeed===51}
                        onClick={ () => {dispatch({type:"animationSpeed",load:51})} }
                    />,
                ]}    
            />,     
            /*<MenuItem 
                primaryText="Quality"
                className="no-drag"
                rightIcon={<ArrowDropRight />} 
                menuItems={[
                    <MenuItem  
                        className="no-drag" 
                        primaryText="Low" 
                        checked={commonVectorSpaceProps.quality==="low"} 
                        onClick={ () => {dispatch({type:"quality",load:"low"})} }
                    />,  
                    <MenuItem  
                        className="no-drag" 
                        primaryText="High" 
                        checked={commonVectorSpaceProps.quality==="high"} 
                        onClick={ () => {dispatch({type:"quality",load:"high"})} }
                    />   
                ]}   
            />,*/  

            <MenuItem 
                primaryText="Autorotate"   
                onClick={ () => {dispatch({type:"autorotate"})} }
                checked={commonVectorSpaceProps.autorotate}
            />,   

            <MenuItem    
                primaryText="Clear scene after each operation"   
                onClick={ () => {dispatch({type:"clearScene"})} }
                checked={commonVectorSpaceProps.clearScene}
            />,   
          ]}
        />   

        <Divider/>

        <MenuItem
          primaryText="Interface settings"
          className="no-drag"
          //checked={true}
          rightIcon={<ArrowDropRight />}
          menuItems={[
             
            <MenuItem  
                primaryText="Color"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem> 
                        {colorPicker(
                            (color) => {   
                                dispatch({type:"interfaceColor",load:color})
                            }  
                        )} 
                    </MenuItem> 
                ]} 
            />,   
            /*<MenuItem 
                primaryText="Layout"
                className="no-drag"
                rightIcon={<ArrowDropRight />}
                menuItems={[
                    <MenuItem   
                        className="no-drag" 
                        primaryText="Horizontal" 
                        onClick={ () => {dispatch({type:"layout",load:"horizontal"})} } 
                        checked={appReducer.layout==="horizontal"} 
                    />,   
                    <MenuItem    
                        className="no-drag"    
                        primaryText="Vertical" 
                        onClick={ () => {dispatch({type:"layout",load:"vertical"})} } 
                        checked={appReducer.layout==="vertical"} 
                    />     
                ]} 
            />*/    
 
          ]}
        /> 
    </IconMenu>; 
 
  
export let topMenu = (dispatch:Function, commonVectorSpaceProps, appReducer) : JSX.Element =>  
    <Toolbar style={{
        backgroundColor:"rgb(48, 48, 48)",
        position:"fixed", 
        zIndex:2001, 
        width:"100%",
    }}>  
        <div className="drag" style={{position:"fixed", width:"100%"}}></div>  
        <ToolbarGroup firstChild={true}>
           {leftMenu(dispatch,commonVectorSpaceProps,appReducer)}  
        </ToolbarGroup>   
        <ToolbarGroup>
        <ToolbarSeparator /> 
            {refresh()} 
            {hideButton()}
            {toggleSizeButton()}
            {closeButton()} 
        </ToolbarGroup> 
    </Toolbar>; 
   