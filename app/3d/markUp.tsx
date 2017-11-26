import { Vector2, Vector3 } from "three";
import { curry } from 'ramda';
import { Component } from "react";
import * as React from 'react';
import { Observable } from 'rxjs/Rx';

export let init2dCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => canvas.getContext('2d');

let toCanvasOrigin = curry(
    (width:number,height:number,position : Vector2) : Vector2 => {
        let newPosition = new Vector2();
        newPosition.x=position.x+width/2;
        newPosition.y=position.y+height/2;  
        return newPosition;
    } 
);     

let setCanvasBackgroundColor = (ctx : CanvasRenderingContext2D, width:number, height:number, color : string) => {
    ctx.fillStyle=color;
    ctx.fillRect(0,0,width,height);
}; 

export let putDot2d = curry((ctx : CanvasRenderingContext2D, width:number, height:number, position : Vector2, radius : number, color:string) : void => {
    let centered = toCanvasOrigin(width,height,position);
   
    ctx.beginPath();                     
    ctx.fillStyle=color;     
    ctx.arc(centered.x,centered.y,radius,0,2*Math.PI,true);
    ctx.closePath();    
    ctx.fill();  
});

      
export let putLabel = curry(
    (ctx:CanvasRenderingContext2D, width:number, height:number, label:Label) : void => {
        if(!label)
            return;
 
        ctx.font = "900 " + label.size.toString() + "px Arial";
        ctx.fillStyle=label.color;  

        let x = label.position.x; // * (width/100);
        let y = label.position.y; // * (height/100);

        ctx.fillText(label.text, x, y);    
    } 
);          


export interface Label{
    position : {x:number,y:number},
    text : string,
    color : string,
    size : number 
};

 
export interface MarkUpProps{
    labels:Label[],
    width:number,
    height:number
};


interface MarkUpState{}; 


export class MarkUp extends Component<MarkUpProps,MarkUpState>{

      container:HTMLElement;
      
      canvas:HTMLCanvasElement;
      
      context:CanvasRenderingContext2D;

      constructor(props){

          super(props); 
          let canvas : HTMLCanvasElement = document.createElement('canvas'); 
          this.canvas=canvas;  

           
      };       
      
      componentDidMount(){
           
          Observable.fromEvent(this.container,"resize")
          .subscribe(
            this.setDimensions
          ); 
          
          this.container.appendChild(this.canvas);  
          this.setDimensions();
          this.context=this.canvas.getContext('2d'); 
          this.props.labels.forEach(putLabel(this.context,this.canvas.width,this.canvas.height));  
          setCanvasBackgroundColor(this.context,this.canvas.width,this.canvas.height,"rgba(0, 0, 0, 0)"); 
          this.setState({});  

      };  
        
      setDimensions = () => {
          let rect = this.container.getBoundingClientRect();
          this.canvas.width=this.props.width;//rect.width;
          this.canvas.height=this.props.height;//rect.height;
      };   
 
      componentDidUpdate(){ 
        if(this.canvas){ 
            this.context=this.canvas.getContext('2d'); 
            this.setDimensions();      
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.props.labels.map(putLabel(this.context, this.canvas.width, this.canvas.height));  
        }; 
      }; 
      
      render(){     
          return <div ref={element => this.container=element} 
                    style={{ 
                       position:"absolute",   
                       width:this.props.width + "px", //"inherit", 
                       height:this.props.height + "px",  
                       pointerEvents: "none"
                    }}> 
                 </div>
      }; 

}; 
 