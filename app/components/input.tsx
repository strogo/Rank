import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import {
    map, addIndex, range, merge, equals, prop,     
    assocPath, isEmpty, curry, clone, cond, all, reduce, flatten, 
    compose, contains, and, find, defaultTo, last, isNil, concat, 
    split, filter, take, drop, splitEvery, ifElse, identity, join, toString             
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
import { attachDispatchToProps, cutDigits, setInput, squeezeCurrentResult, selectEnabledActions, isOperator, isMatrix } from "./utils";

 
let storeToinputProps = (store,props) => clone(store.inputReducer);  
@connect(storeToinputProps, attachDispatchToProps) 
export class InputActions extends Component<any,any>{
      
      constructor(props){
          super(props);
      }; 

      componentDidUpdate(prevProps, prevState){
          //console.log(this.props.currentResult,"currentResult");
          //console.log(this.props.inputChain, "inputChain");
      };
      
      render(){
        return Input(clone(this.props));   
      }; 
};   
 


let submitInput = (newinputState, operator) => { 
     
    if(!isNil(operator) && isOperator(operator)){

        newinputState.inputChain.push(operator);
         
        newinputState.currentResult.push(operator);  

    }else{ 

        switch(newinputState.type){  
            case "Matrix3":     
                let matrix = new Matrix3().fromArray([
                    newinputState.matrixInput.x1,
                    newinputState.matrixInput.y1, 
                    newinputState.matrixInput.z1,
                    newinputState.matrixInput.x2,
                    newinputState.matrixInput.y2,
                    newinputState.matrixInput.z2,
                    newinputState.matrixInput.x3,
                    newinputState.matrixInput.y3,
                    newinputState.matrixInput.z3
                ].map(
                    (n) => isNaN(Number(n)) ? 0 : Number(n)
                )); 
                newinputState.inputChain.push(matrix); 
                newinputState.currentMatrix=matrix; 
                newinputState.currentResult.push(matrix); 
                break;      
            case "Vector3":
                let vector = new Vector3().fromArray([
                    newinputState.vectorInput.x,
                    newinputState.vectorInput.y,
                    newinputState.vectorInput.z 
                ].map(  
                    (n) => isNaN(Number(n)) ? 0 : Number(n)
                ));      
                newinputState.inputChain.push(vector);
                newinputState.currentResult.push(vector);
                break;       
            case "number": 
                newinputState.inputChain.push(
                    isNaN(Number(newinputState.scalarInput)) ? 0 : Number(newinputState.scalarInput)
                ); 
                newinputState.currentResult.push(
                    isNaN(Number(newinputState.scalarInput)) ? 0 : Number(newinputState.scalarInput)
                ); 
                break;       
        };  

   };
       
   let newCurrentResult=squeezeCurrentResult(
       clone(newinputState.currentResult)
   );

   if(!isNil(newCurrentResult)){
      newinputState.currentResult=[newCurrentResult]; 
      if(isMatrix(newCurrentResult as any))
        newinputState.currentMatrix=newCurrentResult; 
   };

   //newinputState.blocked=true;  

   return newinputState;  
};  

const defaultInputState = {       
    currentResult : [], 
    currentMatrix : new Matrix3().identity(),  
    inputChain : [], 
    inputOpen: false, 
    showExponentPopup: false,  
    anchorEl: null,
    selectedId : null, 
    success:false, 
    matrixInput : {     
      x1:"0", y1:"0", z1:"0", 
      x2:"0", y2:"0", z2:"0", 
      x3:"0", y3:"0", z3:"0"
    }, 
    vectorInput : {x:"0", y:"0", z:"0"},
    scalarInput : "0", 
    blocked : false,  
    type : "Matrix3" 
};
 
export let inputReducer = (    
    state=defaultInputState,  
    action     
) => {                 
    let newinputState = clone(state); 
     
    return cond([    
        [ 
            equals("selectedId"),      
            () => assocPath(['selectedId'], action.load, newinputState)  
        ],   
        [
            equals("type"), 
            () => assocPath(["type"], action.load, newinputState)
        ], 
        [
            equals("input"), 
            () => assocPath(["input"], action.load, newinputState)
        ],
        [
            equals("matrixInput"), 
            () => assocPath(["matrixInput"], action.load, newinputState)
        ],
        [
            equals("vectorInput"), 
            () => assocPath(["vectorInput"], action.load, newinputState)
        ],
        [
            equals("scalarInput"), 
            () => assocPath(["scalarInput"], action.load, newinputState)
        ],   
        [
            equals("closePopUp"), 
            () => assocPath(['inputOpen'],!state.inputOpen, newinputState)
        ],   
        [
            equals("success"), 
            () => assocPath(['success'], action.load , newinputState)
        ],   
        [
            equals("openPopUp"), 
            () => compose(
                    assocPath(['anchorEl'],action.load), 
                    assocPath(['inputOpen'],!state.inputOpen) 
                  )(newinputState) 
        ],     
        [       
            equals("submit"), 
            () => submitInput(newinputState,action.load)  
        ],   
        [
            equals("blocked"), 
            () => assocPath(['blocked'], false, newinputState)
        ],
        [
            equals("showExponentPopup"), 
            () => assocPath(['showExponentPopup'], !state.showExponentPopup, newinputState)
        ],      
        [
            equals("closeExponentPopup"), 
            () => assocPath(['showExponentPopup'], !state.showExponentPopup, newinputState)
        ],
        [
            equals("reload"),
            () => {
               return defaultInputState;    
            } 
        ], 
        [  
            () => true, 
            () => newinputState 
        ] 
    ])(action.type); 
};  
 

let changeToEnabledInput = (props, enabled, setInputType) => {
    //enabled.matrix  enabled.vector enabled.scalar
    if(props.type==="Matrix3" && !enabled.matrix){

        if(enabled.vector){
            setInputType("Vector3");    
        }else if(enabled.scalar){
            setInputType("number");    
        };
            
    }else if(props.type==="Vector3" && !enabled.vector){

        if(enabled.matrix){
            setInputType("Matrix3");    
        }else if(enabled.scalar){
            setInputType("number");  
        };

    }else if(props.type==="number" && !enabled.scalar){
        
        if(enabled.vector){
            setInputType("Vector3"); 
        }else if(enabled.matrix){
            setInputType("Matrix3"); 
        };

    };

}; 


let Input = (props) : JSX.Element => { 
 
    let setSelectedId = (id : string) => { 
        props.dispatch({type:"selectedId", load:id});
    };  
 
    let setInputType = (type: "Matrix3" | "Vector3" | "number") => { 
        props.dispatch({type:"type", load:type});
    };
  
    let setMatrixInput = (matrix:any) => {    
        props.dispatch({type:"matrixInput", load:matrix});
    };
                
    let setVectorInput = (vector:any) => {
        props.dispatch({type:"vectorInput", load:vector});
    }; 
   
    let setScalarInput = (scalar:string) => {
        props.dispatch({type:"scalarInput", load:scalar}); 
    }; 
     
    let enabled = selectEnabledActions(props.currentResult);


    let unblock = () => {
        setTimeout( () => {
            props.dispatch({type:"blocked"});
        }, 1000 );
    };


    changeToEnabledInput(props,enabled,setInputType);

    let debounce = (fun, mil=500) => {
        let timer; 
        return function(load){
            clearTimeout(timer); 
            timer = setTimeout(function(){
                fun(load); 
            }, mil); 
        }; 
    }; 

    let debounced = debounce(
        (load:string) => {
               props.dispatch({type:"submit",load});    
        }    
    );
    
    return <div style={{marginRight:"3%"}}>  
        <Popover      
            open={props.showExponentPopup}    
            canAutoPosition={false} 
            autoCloseWhenOffScreen={false} 
            anchorEl={document.getElementById(props.selectedId)}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}} 
            onRequestClose={() => props.dispatch({type:"closeExponentPopup"})} 
        >                 
                <ul style={{backgroundColor: "white",width: "150px"}}>
                     {map(        
                        (n:number) =>
                            <li style={{ 
                                    display:"inline-block",
                                    margin:"10px",
                                    verticalAlign:"top"
                                }} 
                                key={uniqid()} onClick={
                                    (event) => {
                                         let target = document.getElementById(props.selectedId);
                                         if(target){    
                                                let newValue = Math.pow(Number(target["value"]),n);  
                                                setInput(   
                                                    props, 
                                                    setMatrixInput,
                                                    setVectorInput, 
                                                    setScalarInput,
                                                    newValue
                                                );           
                                                props.dispatch({type:"closeExponentPopup"})          
                                         };
                                    }
                                } 
                            >   
                                <div className={"exponentButton"}>
                                    <div style={{textAlign:"center"}}>
                                        x<sup>{n}</sup>
                                    </div>   
                                </div>          
                            </li> 
                     )(range(2,10))}         
                </ul>
        </Popover>
        <FloatingActionButton mini={true}  
            onTouchTap={ 
                (event) => { 
                    event.preventDefault(); 
                    props.dispatch({type:"openPopUp", load:event.currentTarget}); 
                }  
            } 
        >  
            <InputIcon />   
        </FloatingActionButton>
           
        <Popover   
            open={props.inputOpen} 
            autoCloseWhenOffScreen={false}
            anchorEl={props.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={() => props.dispatch({type:"closePopUp"})}
        >          
  
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", width:"700px" }}>   
             
                <div style={{margin:"20px", width:"200px", height:"180px"}}>  
                    {  
                        InputTable(
                            setInputType, 
                            setMatrixInput,
                            setVectorInput,
                            setScalarInput,
                            enabled,
                            props
                        ) 
                    }      
                </div>      
                
                <div style={{display:"flex", justifyContent:"center", alignItems:"center", margin:"20px", width:"400px"}}>
                    
                {   
                    props.type === "Matrix3" ? 
                        <MatrixInput 
                          setSelectedId={setSelectedId} 
                          setMatrixInput={setMatrixInput} 
                          selectedId={props.selectedId}
                          matrixInput={props.matrixInput}
                          disabled={!enabled.matrix}
                        /> : 
                    props.type === "Vector3" ? 
                        <VectorInput   
                         setSelectedId={setSelectedId}  
                         setVectorInput={setVectorInput}
                         selectedId={props.selectedId} 
                         vectorInput={props.vectorInput}
                         disabled={!enabled.vector} /> :
                    props.type === "number"  ? 
                        <ScalarInput setSelectedId={setSelectedId} 
                                     setScalarInput={setScalarInput}
                                     scalarInput={props.scalarInput}
                                     disabled={!enabled.scalar} /> : 
                    null   
                }             
                </div>     
                           
                <div style={{display:"flex", flexDirection:"column", width:"100%", overflowX:"hidden"}}>    

                <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>     
                    <RaisedButton 
                        disabled={ props.blocked ? true : !enabled.plus} style={{margin:"5px"}} label="Plus" 
                        onClick={() => {debounced("plus")}}
                    />
                    <RaisedButton 
                        disabled={ props.blocked ? true : !enabled.minus} style={{margin:"5px"}} label="Minus" 
                        onClick={() => debounced("minus")} 
                    />
                    <RaisedButton 
                        disabled={ props.blocked ? true : !enabled.dot} style={{margin:"5px"}} label="Dot" 
                        onClick={() => debounced("dot")}
                    />  
                    <RaisedButton 
                        disabled={ props.blocked ? true : !enabled.multiply} style={{margin:"5px"}} label="Scale" 
                        onClick={() => debounced("multiply")}
                    /> 
                    <RaisedButton 
                        disabled={ props.blocked ? true : !enabled.cross} style={{margin:"5px"}} label="Cross" 
                        onClick={() => debounced("cross")}
                    />  
                </div>     
      
                <RaisedButton  
                    disabled={ props.blocked ? true : !enabled.set} style={{margin:"5px"}} label="Set"
                    onClick={() => debounced(undefined)} 
                />
                
                </div> 
            </div>             
        </Popover>
    </div> 
};    

   
interface ScalarInputProps{
    setSelectedId : (id : string) => void,
    setScalarInput : (scalar:string) => void,
    scalarInput:string,
    disabled : boolean  
};     
      
class ScalarInput extends Component<ScalarInputProps,any>{

     inputStyle:Object;
     
     containerStyle:Object; 

     hintStyle:Object;
 
     constructor(props){
        super(props);

        this.inputStyle={color:cyan700, textAlign:"center"};
     
        this.containerStyle={width:"80px"};

        this.hintStyle={
            color:cyan700, textAlign:"center", 
            left:"50%", marginLeft:"-10px",
            width:"20px"
        };  
     };  
       
     componentDidUpdate(){ 
        let target = document.getElementById("scalarInput");

        if(target)
           target.focus();
     }; 
     
     render(){ 
        return <table className="matrix"> 
        <tbody> 
        <tr key={uniqid()}>  
            <td key={uniqid()}>        
                <TextField id={"scalarInput"} 
                    style={this.containerStyle}     
                    value={cutDigits(this.props.scalarInput)}   
                    disabled={this.props.disabled} 
                    hintStyle={this.hintStyle} 
                    onChange={(e,v) => {  

                        if(!isNaN(v) || v==="-")// || v===".")
                            if(v[0]==="0" && v[1]!="." && v[1]!=undefined)  
                              this.props.setScalarInput(v.replace(/^[0]+/g,"")); 
                            else  
                              this.props.setScalarInput(v);  
                          
                    }}      
                    onBlur = {  
                     (e) => {  
                        let target=e.target; 
                        target.focus(); 
                     }
                    }  
                    onClick = {  
                     (e) => {  
                        this.props.setSelectedId("scalarInput"); 
                     } 
                    } 
                    inputStyle={this.inputStyle} 
                /> 
            </td>
        </tr>      
        </tbody>  
        </table> 
     };
};
  

interface VectorInputProps{
    setSelectedId : (id : string) => void,
    setVectorInput : (v : any) => void,
    selectedId : string,
    vectorInput : any,
    disabled : boolean 
};    
 
class VectorInput extends Component<VectorInputProps,any>{
       
    inputStyle : any;
    containerStyle : any;
    hintStyle : any;
        
    constructor(props){
        super(props); 

        this.inputStyle={color:cyan700, textAlign:"center"};
        
        this.containerStyle={width:"80px"};

        this.hintStyle={
            color:cyan700, textAlign:"center", 
            left:"50%", marginLeft:"-10px",
            width:"20px"
        };
    };
 
    componentDidUpdate(){  
        let target = document.getElementById(this.props.selectedId);
        if(target)
           target.focus();
     };
        
    render(){
      return <table className="matrix"> 
                <tbody>  
                <tr key={uniqid()}>{
                    map( 
                        (id:string) => 
                            <td key={uniqid()}>     
                                <TextField id={id} 
                                    style={this.containerStyle} 
                                    disabled={this.props.disabled}   
                                    value={cutDigits(this.props.vectorInput[id])} 
                                    hintStyle={this.hintStyle}  
                                    onBlur = {  
                                        (e) => {  
                                            let target=e.target; 
                                            target.focus(); 
                                        } 
                                    } 
                                    onChange={    
                                        (e,v) => {  
                                            if(!isNaN(v) || v==="-"){// || v===".")
                                                if(v[0]==="0" && v[1]!="." && v[1]!=undefined)  
                                                    this.props.vectorInput[id]=v.replace(/^[0]+/g,"");
                                                else   
                                                    this.props.vectorInput[id]=v;    
                                                        
                                                this.props.setVectorInput(this.props.vectorInput); 
                                            };  
                                        }   
                                    }        
                                    onMouseDown = {
                                        (e) => {  
                                            this.props.setSelectedId(id); 
                                        } 
                                    }
                                    inputStyle={this.inputStyle} 
                                />  
                            </td>
                    )(  
                        ["x","y","z"] 
                    )
                }</tr>      
            </tbody>  
        </table> 
  }; 
};
 

 
interface MatrixInputProps{
    setSelectedId : (id : string) => void,
    setMatrixInput : (v : any) => void 
    selectedId : string,
    matrixInput : any,
    disabled:boolean 
};   
    
class MatrixInput extends Component<MatrixInputProps,any>{
    inputStyle
    containerStyle
    hintStyle 

    id1
    id2
    id3
     
    constructor(props){
        super(props);
        this.inputStyle={color:cyan700, textAlign:"center"};

        this.containerStyle={width:"80px"};

        this.hintStyle={
            color:cyan700, textAlign:"center", 
            left:"50%", marginLeft:"-10px",
            width:"20px"
        };

        this.id1=uniqid();
        this.id2=uniqid();
        this.id3=uniqid(); 
    }; 
 

    /*componentDidUpdate(){
        let target = document.getElementById(this.props.selectedId); 
            if(target){
                target.focus();
            }; 
    }*/ 
        
    render(){    
         
     return <table className="matrix"> 
            <tbody>{
              compose(            
                addIndex(map)( (items,idx) => <tr key={this["id"+(idx+1)]}>{items}</tr> ),     
                splitEvery(3),    
                addIndex(map)( 
                    (id:number,idx:number) =>     
                        <td key={id+idx}>    
                            <TextField id={id}    
                               // key = {id+idx+idx} 
                                style={this.containerStyle}   
                                value={( 
                                  () => cutDigits(this.props.matrixInput[id])  
                                )()}   
                                disabled={this.props.disabled}   
                                onBlur = {(e) => {}}     
                                onChange={(e,v) =>  {  
                                    let newInput = clone(this.props.matrixInput);

                                    if(!isNaN(v) || v==="-"){// || v===".")
                                        if(v[0]==="0" && v[1]!="." && v[1]!=undefined)  
                                           newInput[id]=v.replace(/^[0]+/g,"");
                                        else   
                                           newInput[id]=v;     
                                    };   

                                    this.props.setMatrixInput(newInput); 
                                }}     
                                onMouseDown = { 
                                    (e) => {
                                        this.props.setSelectedId(String(id)); 
                                    }
                                }  
                                inputStyle={this.inputStyle} 
                            />  
                        </td> 
                )
               )(  
                   ["x1","y1","z1","x2","y2","z2","x3","y3","z3"]
               )
            }</tbody>  
            </table>   
    };
      
};  

 
 
let InputTable = (
    setInputType, 
    setMatrixInput,
    setVectorInput,
    setScalarInput,
    enabled,
    props 
) : JSX.Element=> { 
  
    let onOperationRequest = (type:string) : void => {
        let target = null; 
        switch(type){ 
           case "trash":   
              props.dispatch({type:"reload"}); 
              return;     
           case "A":
              setInputType("Matrix3");
              break;   
           case "v": 
              setInputType("Vector3"); 
              break;  
           case "s": 
              setInputType("number");
              break;   
           case "cos":
              target = document.getElementById(props.selectedId);
              if(target){    
                 let newValue : number = Math.cos(Number(target["value"]));  
                 setInput(
                     props,setMatrixInput,
                     setVectorInput,
                     setScalarInput,newValue
                 ); 
              };    
              break; 
           case "sin": 
              target = document.getElementById(props.selectedId);
              if(target){    
                 let newValue : number = Math.sin(Number(target["value"]));  
                 setInput(
                    props,setMatrixInput,
                    setVectorInput,
                    setScalarInput,newValue
                ); 
              };   
              break; 

           case "tan":
              target = document.getElementById(props.selectedId);
              if(target){      
                let newValue : number = Math.tan(Number(target["value"]));  
                setInput(
                    props,setMatrixInput, 
                    setVectorInput,
                    setScalarInput,newValue
                ); 
              };    
              break;

           case "sqrt":
              target = document.getElementById(props.selectedId);
              if(target){     
                    let newValue : number = Number(target["value"]) > 0 ? 
                                            Math.sqrt(Number(target["value"])) : Number(target["value"]);  
                                                
                    setInput(   
                        props,setMatrixInput, 
                        setVectorInput,
                        setScalarInput,newValue
                    ); 
               };    
               break;

           case "e":
              target = document.getElementById(props.selectedId);
              if(target){    
                 let newValue = Math.E;   
                 setInput(
                     props,setMatrixInput,
                     setVectorInput,
                     setScalarInput,newValue
                 ); 
              };   
              break;  
           case "ln":
              target = document.getElementById(props.selectedId);
              if(target){    
                 let newValue = Math.log(Number(target["value"]));  
                 setInput(props,setMatrixInput,
                    setVectorInput,
                    setScalarInput,newValue
                );  
              };   
              break;  
           case "pi":
              target = document.getElementById(props.selectedId);
              if(target){    
                 let newValue = Math.PI;  
                 setInput(props,setMatrixInput,
                    setVectorInput,
                    setScalarInput,newValue
                ); 
              };   
              break;     
           case "xn":
              target = document.getElementById(props.selectedId);
              if(target){     
                 //let newValue = Number(target["value"]); 
                 //setInput(props,newValue);  
                 props.dispatch({type:"showExponentPopup"})
              };   
              break; 
        }; 
    }; 
    
    return <div style={{display:"flex", flexDirection:"column"}}>
                <ul style={{
                    listStyleType:"none",
                    width:"200px" 
                }}>       
                { 
                    flatten([     
                        [
                            <li key={uniqid()} style={{
                                            display:"inline-block",
                                            margin:"10px",
                                            verticalAlign:"top"
                                    }}>      
                                <div    
                                    className={enabled.matrix ? "inputButton" : "inputButtonDisabled"} id={"A"} 
                                    onClick={(event) => enabled.matrix ? onOperationRequest("A") : ""}  
                                >
                                </div> 
                            </li>,
                            <li key={uniqid()} style={{
                                    display:"inline-block",
                                    margin:"10px",
                                    verticalAlign:"top"
                            }}>      
                                <div   
                                    className={enabled.vector ? "inputButton" : "inputButtonDisabled"} id={"v"} 
                                    onClick={(event) => enabled.vector ? onOperationRequest("v") : ""}
                                >
                                </div>  
                            </li>, 
                            <li key={uniqid()} style={{
                                    display:"inline-block",
                                    margin:"10px",
                                    verticalAlign:"top"
                            }}>        
                                <div     
                                    className={enabled.scalar ? "inputButton" : "inputButtonDisabled"} id={"s"} 
                                    onClick={(event) => enabled.scalar ? onOperationRequest("s") : ""}
                                >
                                </div> 
                            </li>
                        ],

                        map((id:string) =>  
                                <li key={uniqid()} style={{
                                        display:"inline-block",
                                        margin:"10px",
                                        verticalAlign:"top"
                                }}>      
                                    <div     
                                        className={enabled.set ? "inputButton" : "inputButtonDisabled"}
                                        id={id} 
                                        onClick={(event) => enabled.set ? onOperationRequest(id) : ""}
                                    > 
                                    </div> 
                                </li>
                        )(["cos", "sin", "tan", "sqrt", "e", "ln", "pi", "xn"]),
                        [
                            <li key={uniqid()} style={{
                                    display:"inline-block",
                                    margin:"10px",
                                    verticalAlign:"top"
                            }}>           
                                <div       
                                    className={"inputButton"} id={"trash"} 
                                    onClick={(event) => onOperationRequest("trash")}
                                >  
                                </div> 
                            </li> 
                        ] 
                   ]) 
                } 
                </ul>      
           </div>; 
};  



 

 