import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import CircularProgress from 'material-ui/CircularProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
var Spinner = require('react-spinkit');
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import '../assets/styles.css';    
import { muiTheme } from "./utils";
import { topMenu } from "./toolBar";
import { mathJax } from "./mathJax";
/*
(() =>{
    let app=document.createElement('div');
    app.id='animation';  
    document.body.appendChild(app); 
})();   
*/   
   
interface AnimationProps{
    show:boolean,
    randomRule:string
};  

interface AnimationState{
    dots:string
}; 
  
  
export class Animation extends React.Component<AnimationProps,AnimationState>{
     
     constructor(props){ 
         super(props);  
         this.state={ 
               dots:"" 
         }; 
 
         this.addDots=this.addDots.bind(this);
          
         /*setInterval( 
            this.addDots, 
            500
         );*/  
     };

     componentDidMount(){ 
        /*let animText = () => {  
            if(this.state.fade){ 
                this.setState({visibility:this.state.visibility-0.01});
            }else{
                this.setState({visibility:this.state.visibility+0.01});
            };

            if(this.state.visibility>=1)
                this.setState({fade:true}); 
            else if(this.state.visibility<=0)
                this.setState({fade:false});

            requestAnimationFrame(animText); 
        }; 
         
        animText();*/ 
     };
     
         
     addDots(){ 
            let dots = this.state.dots + "."; 
            dots = dots.length<=3 ? dots : "";
            this.setState({dots:dots}); 
     };    
        
     setColor = () => {
         return "rgba(255,255,255,1)"; 
     };
///{this.state.dots} 
     render(){    
        return <div style={{height:window.innerHeight, width:window.innerWidth}}> 
        <div  
            className={"loading"}
            style={{ 
                width:"100%",
                height:"100%", 
                display:this.props.show ? "flex" : "none",
                flexDirection:"column",
                justifyContent:"center", 
                alignItems:"center" 
            }}
        > 
               <div style={{  
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignItems: "center",
                    height: "100%",
                    width: "100%"
                }}>         
                    
                <div   
                    className={"times"}
                    style={{
                        color:this.setColor(),
                        justifyContent:"center",
                        alignItems:"center",
                        overflowWrap: "break-word",  
                        textAlign:"center",
                        width: "70%"  
                    }}
                >    
                   { 
                       this.props ? 
                       (this.props.randomRule ? 
                       this.props.randomRule : "") 
                       : 
                       ""
                   }
                </div>
                    <Spinner     
                        //style={{transform:'scale(3,3)'}}    
                        name="line-scale-pulse-out" 
                        color="white"     
                    /> 
                </div>    
              </div>   
        </div>         
     }; 
};   
   

/* 
<h3 className="fade" style={{zIndex:10000, cursor:"pointer", marginTop:"150px", fontSize:"30px",color:this.setColor()}}>  
                        Loading   
                    </h3>
  
ReactDOM.render(    
  <MuiThemeProvider muiTheme={muiTheme}>  
        <div> 
           <Animation show={false}/>
        </div> 
   </MuiThemeProvider>,
  document.getElementById('animation')
) */ 