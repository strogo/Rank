import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import {ipcRenderer} from 'electron';
import {isEmpty} from 'ramda';
import '../assets/error.css';   
import { topMenu, toggleSizeButton, closeButton, refresh, hideButton} from "./toolBar";
import { wrapMuiThemeDark } from "./utils"; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import Settings from 'material-ui/svg-icons/action/settings';
let init = () =>{    
    let application=document.createElement('div');
    application.id='error';  
    document.body.appendChild(application);  
};    

  
init();  

 
interface ErrorState{};
 
interface ErrorProps{   
   error:string    
};   
    
  ///<img className={'centered'} src="error(2).jpg"></img>   
class Error extends React.Component<ErrorProps,ErrorState>{
         
    constructor(props){ 
        super(props);      
    };   
  
    render(){        
        return wrapMuiThemeDark(<div className={"gradient"} style={{height:window.innerHeight}}>  
                <div style={{
                    position: "absolute",
                    width: "100%" 
                }}>
                <Toolbar style={{backgroundColor:"rgb(48, 48, 48)"}}>  
                    <div className="drag" style={{position:"fixed", width:"100%"}}></div>  
                    <ToolbarGroup firstChild={true}>
                    <IconMenu className="no-drag"
                touchTapCloseDelay={0}
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
            </IconMenu> 
                    </ToolbarGroup>   
                    <ToolbarGroup>
                    <ToolbarSeparator /> 
                        {refresh()} 
                        {hideButton()}
                        {toggleSizeButton()}
                        {closeButton()} 
                    </ToolbarGroup> 
                </Toolbar>; 
                </div> 
               <div className={'centered'}>   
                  <div style={{width:'100%', display:"flex", justifyContent: "center"}}>
                  <div className={'elem centered'}>
                    <h3 style={{fontFamily:'Lobster Two',fontSize:25, color:'red'}}>Unexpected error occured:</h3>
                    <p style={{fontFamily:'Lobster Two',fontSize:25, color:"white"}}>{this.props.error}</p>  
                  </div>
                  </div>  
               </div>
               </div>); 
    };
         
};   
          
                 
ipcRenderer.on( 
    'loadError', 
    (event, error : string) => {   
        ReactDOM.render(   
            <Error error={error} />,   
            document.getElementById('error')
        );  
    }  
      
);



 


 
 