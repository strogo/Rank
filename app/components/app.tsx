import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { map, addIndex, range, merge, isEmpty, curry, cond, compose, contains, mergeAll,
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
import Videocamera from 'material-ui/svg-icons/av/videocam';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Face from 'material-ui/svg-icons/social/sentiment-very-satisfied'; 
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MathJax = require('react-mathjax-updated');
import randomstring = require("randomstring");
import { Component } from "react"; 
import { InputActions, inputReducer } from "./input";
import { Matrix3, Vector3 } from "three";
import { wrapMuiThemeDark, attachDispatchToProps, muiTheme, getRandomRule } from "./utils";
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
import { LeftPanel } from "./leftpanel";
import { vectorSpaceReducer } from "../3d/vectorSpaceReducer";
import { store } from "./store";
const {screen} = require('electron').remote;
let uniqid = require('uniqid'); 
const {Matrix,inverse,solve} = require('ml-matrix'); 

 
injectTapEventPlugin();      
//material-ui/svg-icons/action/3d-rotation
//css cursor: url('/assets/img/volume-up.svg'), pointer;  
 

let initApp = () => {      
    let app=document.createElement('div'); 
    app.id='application';   
    document.body.appendChild(app);  
};   
 
   
let initAnimation = () =>{
    let app=document.createElement('div');
    app.id='animation';  
    document.body.appendChild(app); 
};   

let checkWebGl = () => {
    if(!Detector.webgl){ 
        let error = Detector.getWebGLErrorMessage().innerHTML;
        ipcRenderer.send(
            "error", 
            isEmpty(error) ? "Your graphics card does not seem to support WebGL" : error
        );
    }; 
}; 

 

initAnimation();
initApp();

 
ReactDOM.render(     
    <MuiThemeProvider muiTheme={muiTheme}>  
        <Animation show={true} randomRule={getRandomRule()}/>
    </MuiThemeProvider>,
    document.getElementById('animation')
); 
      


     
let storeToAppProps=(store,props) => merge(props,clone(store)); 
      

  
@connect(storeToAppProps, attachDispatchToProps)
export class App extends React.Component<any,any>{

    initialHeight:number; 

    constructor(props){ 
        
        super(props);
        
        this.state={};  

        const {width,height} = screen.getPrimaryDisplay().workAreaSize;
         
        this.initialHeight=height; 
    };   
      
    columnSpaceProps = () => {
        let labelColor = "green";
        //this.props.vectorSpaceReducer.commonVectorSpaceProps.markUpColor;
        return mergeAll([
            {id : 1, label : 'C(A)', labelColor : labelColor}, 
            this.props.vectorSpaceReducer.commonVectorSpaceProps,
            {inputChain : this.props.inputReducer.inputChain}
        ]);  
    };   
 
    nullSpaceProps = () => {      
        let labelColor = "green";
        //this.props.vectorSpaceReducer.commonVectorSpaceProps.markUpColor;
        return mergeAll([
            {id : 2, label : 'N(A)', labelColor : labelColor},
            this.props.vectorSpaceReducer.commonVectorSpaceProps,
            {inputChain : this.props.inputReducer.inputChain} 
        ]); 
    };     
   
    columnSpaceTransposeProps = () => {
        let labelColor = "green";
        //this.props.vectorSpaceReducer.commonVectorSpaceProps.markUpColor;
        return mergeAll([
            {id : 3, label : 'C(Aᵀ)', labelColor :  labelColor},
            this.props.vectorSpaceReducer.commonVectorSpaceProps,
            {inputChain : this.props.inputReducer.inputChain} 
        ]);
    };   
     
    nullSpaceTransposeProps = () => { 
        let labelColor = "green";
        //this.props.vectorSpaceReducer.commonVectorSpaceProps.markUpColor;
        return mergeAll([
            {id : 4, label : 'N(Aᵀ)', labelColor : labelColor},
            this.props.vectorSpaceReducer.commonVectorSpaceProps,
            {inputChain : this.props.inputReducer.inputChain} 
        ]);    
    };   
    
    componentWillMount(){
        checkWebGl();
    };  
    
    componentDidMount(){   
        unmountComponentAtNode(document.getElementById('animation'));
    };
      
    setSelectedSpace = () => {  
       let props = compose(
            merge({fullSize:true}),         
            cond([  
                [equals(1), () => this.columnSpaceProps()],
                [equals(2), () => this.nullSpaceProps()],
                [equals(3), () => this.columnSpaceTransposeProps()],
                [equals(4), () => this.nullSpaceTransposeProps()],
                [() => true, () => this.columnSpaceProps()]
            ]) as any
       )(this.props.vectorSpaceReducer.selectedID);  
 
       return props; 
    };
     
      

    render() {                      
        return  wrapMuiThemeDark( 
                    <div className="flex-column" 
                         style={{ height:this.initialHeight }} 
                    >   
                        {topMenu( 
                            this.props.dispatch,
                            this.props.vectorSpaceReducer.commonVectorSpaceProps,
                            this.props.appReducer  
                        )}  

                        <div style={{backgroundColor:this.props.appReducer.interfaceColor}} className="popOver">
                          <InputChain />   
                          <InputActions />  
                        </div>   

                        <div style={{height:"50%"}} className="flex-row"> 
                           <div style={{backgroundColor:this.props.appReducer.interfaceColor}} className={"leftPanel"}>  
                                <LeftPanel />  
                           </div>
                           <VectorSpaces {...{
                                setSelectedSpace: this.setSelectedSpace(),
                                columnSpaceProps: this.columnSpaceProps(),
                                nullSpaceProps: this.nullSpaceProps(),
                                columnSpaceTransposeProps: this.columnSpaceTransposeProps(),
                                nullSpaceTransposeProps: this.nullSpaceTransposeProps(),
                                onload: () => {}
                              }}  
                            /> 
                        </div>   

                        <Footer />  

                    </div> 
                ); 
    };  

};      
  



interface VectorSpacesProps{
    setSelectedSpace: any,
    columnSpaceProps: any,
    nullSpaceProps: any,
    columnSpaceTransposeProps: any, 
    nullSpaceTransposeProps: any,
    onload : Function
};
 
class VectorSpaces extends Component<VectorSpacesProps,any>{

     constructor(props){
         super(props);
     };

     componentDidMount(){
         this.props.onload();  
     };

     render(){ 
         return <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundColor: "black"
         }}>   
                    <div style={{ width:"70%", height:"100%", position:"relative" }}>  
                        <VectorSpace {...(this.props.setSelectedSpace)} />  
                    </div>     

                    <div style={{ width:"30%", height:"100%" }}>
 
                    <div style={{      
                       display:"flex", flexDirection:"column", justifyContent:"center", 
                       width:"100%", height:"100%", alignItems:"center", overflow:"hidden"
                    }}>
                             
                            <div style={{width:"100%", height:"25%", position:"relative"}}>
                                <VectorSpace {...(this.props.columnSpaceProps)}/> 
                            </div> 
                            <div style={{width:"100%", height:"25%", position:"relative"}}>
                                <VectorSpace {...(this.props.nullSpaceProps)} />
                            </div> 
                            <div style={{width:"100%", height:"25%", position:"relative"}}>
                                <VectorSpace {...(this.props.columnSpaceTransposeProps)} />  
                            </div>  
                            <div style={{width:"100%", height:"25%", position:"relative"}}>
                                <VectorSpace {...(this.props.nullSpaceTransposeProps)} />
                            </div> 
                    </div>  
                    </div> 
                </div> 
     };
};
  
  
ipcRenderer.on(
    'loaded',   
    (event,friends) => {    
    
        ReactDOM.render( 
            <Provider store={store}>
              <App />
            </Provider>,  
            document.getElementById('application')
        );  

    } 
);  
   
    