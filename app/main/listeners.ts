import { readFile, loadApp, loadDonate } from './utils'; 
import fs = require('fs');   
import request = require('request'); 
import path = require("path");
import url = require('url'); 
import child_process = require('child_process');
let randomstring = require("randomstring");  
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import {compose, contains, toPairs, curry, split, replace, mergeAll, addIndex,
        takeLast, map, fromPairs, isEmpty, flatten, defaultTo, range, all,
        prepend, cond, isNil, intersection, insert, add, findIndex, filter, find, remove, reject} from 'ramda';  
import { mainWindow, handleError, initDonationWindow } from "./main";
const {shell} = require('electron')

//app.getVersion
  



interface RegisteredListener{ 
    name : string, 
    callback : (event:any,arg:any) => void
};

export class Listeners {
    
   registeredListeners : RegisteredListener[] 

   constructor(){

     this.registeredListeners = [ 
           { name :"reload", 
             callback : () => { 
               mainWindow.reload();

               loadApp(mainWindow).then( 
                   () => {
                       mainWindow.webContents.send("loaded",null);
                   }
               );  
             } 
           },  
           { name :"close",  
             callback : () => {app.quit();}   
           },  
           { 
             name:"donate", 
             callback : () => {
             shell.openExternal("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=GB8QJG9VGJ45Q")
               //"https://www.paypal.com/ua/cgi-bin/webscr?cmd=_flow&SESSION=rITePuGZTV8bKKLEjtu9V9ese4IC6yPzgdjIFyCegp1bOh600EqRnJNojOK&dispatch=5885d80a13c0db1f8e263663d3faee8d795bb2096d7a7643a72ab88842aa1f54&rapidsState=Donation__DonationFlow___StateDonationLogin&rapidsStateSignature=b588c6363a317f155cd07235cebb1713a5b81127");
                /*let wnd = initDonationWindow(); 
                loadDonate(wnd).then(
                    () => {
                        wnd.show(); 
                    }
                )*/
             }  
           },
           {  
               name:"email",
               callback:() => {
                  shell.openExternal("https://mail.google.com/mail/?view=cm&fs=1&to=anatoly.strashkevich@gmail.com&su=Suggest a feature")
               }
           },
           {   
                name:"bug",
                callback:() => {
                shell.openExternal("https://mail.google.com/mail/?view=cm&fs=1&to=anatoly.strashkevich@gmail.com&su=Report bug")
                }
           },
           {  
            name:"upwork",
            callback:() => {
               shell.openExternal("https://www.upwork.com/freelancers/~017df9cdc3825a5fa4")
            }
           },
           {   
            name :"size", 
            callback : () => {  
                const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
                mainWindow.setSize(width,height);
                mainWindow.center(); 
           }   
           }, 
           { name :"hide", callback : () => { mainWindow.minimize() }},
           { name :"error", callback : (event,error) => { handleError(mainWindow)(error) }}
     ];  
     
     this.startToListen(); 
   }; 
 
   registerListener(listener : RegisteredListener) : void{

       this.registeredListeners.push(listener);

   };  

   unregisterListener(name : string) : void{

       let filtered : RegisteredListener[] = reject( 
           (listener : RegisteredListener) => listener.name==name
       )(this.registeredListeners);
           
       if(filtered.length!==this.registeredListeners.length){
           this.registeredListeners=filtered;  
           ipcMain.removeAllListeners(name); 
       };    

   };
 
   removeAllListeners () : void{
      this.registeredListeners=[];
   }; 
 
   startToListen = () : void => {
       map(
           ({name,callback}) => {
               ipcMain.on(
                   name, 
                   callback
               ); 
           },
           this.registeredListeners
       ); 
   }; 

   stopToListen = () : void => {
       map(
           ({name,callback}) => {
               ipcMain.removeAllListeners(name); 
           },
           this.registeredListeners
       );  
   };

};