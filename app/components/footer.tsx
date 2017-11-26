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
import Email from 'material-ui/svg-icons/communication/email';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import FontIcon from 'material-ui/FontIcon'; 
import Play from 'material-ui/svg-icons/av/play-circle-outline';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import Pause from 'material-ui/svg-icons/av/pause-circle-outline';
import Link from 'material-ui/svg-icons/content/link';      
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


interface FooterState{
    openDialog:boolean 
};

export class Footer extends Component<any,FooterState>{
    
    message : JSX.Element;
    sendEmail:string; 
    constructor(props){
        super(props);
   
        this.state = {
            openDialog:false
        };
          
    }; 
 





    render(){
        return <Paper zDepth={1}>
                    <BottomNavigation>
                        <BottomNavigationItem
                            label="About"
                            icon={ < Face  style={{}} />}
                            onTouchTap={() => {this.setState({openDialog:true})}}
                        />
                    </BottomNavigation>
    
                    <Dialog
                        title="About"  
                        actions={[ 
                            <FlatButton
                                label="OK"
                                primary={true}
                                onTouchTap={() => {this.setState({openDialog:false})}}
                            />           
                        ]}   
                        modal={false}  
                        open={this.state.openDialog}  
                    >     
                    <div> 
                            <h3>Hello my friend!</h3>

                                <br/> 
 
                            <p>  
                                Building this application i've tried to create some sort of visual 
                                aid to help me memorize linear algebra concepts that i'm learning.
                                I believe that with your help i could turn this little project 
                                into something more useful and augment
                                it with sufficient educational value.
                            </p> 

                                <br/>   

                            <h3>Please, consider helping me in the following ways:</h3>
                                
                            <h4> 
                                Suggest a useful feature or modification to project

                                <FlatButton
                                    //backgroundColor="#a4c639"
                                    label="Suggest a feature"
                                    labelPosition="before"
                                    primary={true} 
                                    icon={<Email />}
                                    onClick={() => ipcRenderer.send("email")}
                                />
                            </h4> 
 
                            <h4>
                                 Report bug or any sort of inconsistency
                                 
                                <FlatButton
                                    //backgroundColor="#a4c639"
                                    label="Report bug"
                                    labelPosition="before"
                                    primary={true} 
                                    icon={<Email />}  
                                    onClick={() => ipcRenderer.send("bug")}
                                />
                            </h4>  

                            <h4>  
                                 Hire me on upwork
                                <FlatButton
                                    //backgroundColor="#a4c639"
                                    label="My Profile"
                                    labelPosition="before"
                                    primary={true}  
                                    icon={<Link />}  
                                    onClick={() => ipcRenderer.send("upwork")}
                                /> 
                            </h4>  
   
                            <h4>  
                                 Support this project    
                            <div style={{cursor:"pointer",margin: "30px", textAlign: "center"}} 
                                 onClick = {() => ipcRenderer.send("donate")}>

                                <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"/>

                            </div> 

                            </h4>     
                    </div>
                    </Dialog>    
            </Paper>; 
    };   
}; 
 


export class Advertisement extends Component<any,any>{

    constructor(props){
        super(props);
        
    };
  
    render(){ 
        return <div></div>
    };   

};  

