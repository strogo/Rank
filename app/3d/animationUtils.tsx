import { map, isNil, isEmpty } from 'ramda';
import { Mesh, Scene } from "three";
let uniqid = require('uniqid'); 

 
export interface AnimationController{
    start:() => AnimationController,
    stop:() => AnimationController, 
    getData:() => any,
    onEnd:(f:Function) => AnimationController,
    setNext:(f:Function) => AnimationController
};    
     

export let animationHOF = (  
    speed : number,
    action : (counter:number) => any
) : AnimationController => { 
     
   let initial = 0;
   let data = {}; 
   let next = null; 
   let nextSet = 0;   //how many times next function was set
   let onEnd = [];  
   let id = uniqid();  

   let animate = () => {    
       if(initial===undefined)
          return;  

       if(initial<1) 
          data = action(initial);  
              
       initial += speed;   
       //console.log(initial)

       if(initial<0 || isNaN(initial)) 
          throw new Error("Initial have incorrect value " + initial);
       
       if(initial<1)  

          requestAnimationFrame(animate);  

       else{

          onEnd.map( f => f(data) ); 
          if(!isNil(next)) 
              next(data); 

          controller = undefined;
          initial = undefined;
          data = undefined;
          next = undefined;
          nextSet = undefined;
          onEnd = undefined;
          id = undefined;
          action = undefined; 
       }; 
        
   };  

   let controller = {
        start : () => {
            animate(); 
            //accounter[id] = "opened";
            return controller;
        },
        stop : () => {   
            controller = undefined;
            initial = undefined;
            data = undefined;
            next = undefined;
            nextSet = undefined;
            onEnd = undefined;
            id = undefined;
            action = undefined;
            return controller;
        }, 
        getData : () => data, 
        onEnd : (f:(data:any) => void) => {
            onEnd.push(f); 
            return controller;   
        },
        setNext : (f: (data?) => void) => {
            next = f;     
            nextSet = nextSet + 1;   
            return controller;
        }
   };  
        
   return controller;  

};    

  
export let animationHOFchain = (   
   chain : AnimationController[],
   speed : number,
   middleware : () => void  
) : AnimationController => { 
   //console.log("init")
   let next = null;    //pointer to next function 
   let nextSet = 0;   //how many times next function was set
   let id = uniqid();//unique id of chain 
   let idx = 0;     //current chain element index
   let onEnd = []; //list of functions which will be sequentially executed when chain reaches its end
   let data = []; //result of lower level actions
   let length = chain.length;

   if(!chain || chain.length===0)
       throw new Error("Input chain is empty.");
              
   let stop = () => {    
       //console.log("stop")
       if(nextSet>1)
          throw new Error("Next function set twice.");
    

       idx = length;
 
       onEnd = undefined;

       next = null; 

       data = undefined; 
 
       if(chain && !isEmpty(chain))
          map((instance : AnimationController) => {
            if(instance)  
                instance.stop()
          })(chain); 
   };    

           
   let nextController = (previousResult?:any) => {  
        //console.log("next",idx)
        if(nextSet>1)
           throw new Error("Next function set twice.");  

        if(idx<chain.length) 
           middleware();  
  
        if(previousResult) 
            data.push(previousResult);  
        
        let controller = chain[idx++]; 

        if(controller){
 
            controller.setNext(nextController);

            controller.start();
 
        }else{ 

            onEnd.map( f => f(data) );

            if( !isNil(next) )
                next(data); 
            
            next = undefined;     
            
            chain = undefined;

            data = undefined;

            onEnd = undefined;     

        };   

   };   
 
 
 
   let controller = {
        start : () => { 
            if(nextSet>1)
                throw new Error("Next function set twice.");
            nextController(); 
            //accounter[id]="opened";
            controller.start = () => controller;
            return controller;  
        }, 
        stop : () => { 
            if(nextSet>1)
                throw new Error("Next function set twice.");
            stop();  
            controller = undefined;
            chain = undefined; 
            data = undefined;
            onEnd = undefined;     
            return controller; 
        },
        getData : () => data,    
        onEnd : (f:(data:any) => void) => {
            if(nextSet>1)
                throw new Error("Next function set twice.");
            onEnd.push(f); 
            
            return controller;    
        }, 
        setNext : (f: (data?) => void) => { 
            if(nextSet>1)
                throw new Error("Next function set twice.");
            next=f;  
            nextSet = nextSet + 1;    
            return controller;
        } 
    };  
      
    return controller; 
};

