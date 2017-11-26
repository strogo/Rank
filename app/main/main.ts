import { readFile, loadApp, loadError } from './utils'; 
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
import { Listeners } from "./listeners";
const EventEmitter = require('events').EventEmitter
export let mainWindow;  
  
//app.getVersion
   
 

export let handleError = (window) => (error) => loadError(window,error).then(() => mainWindow.show());

 
let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
preventAnnoyingErrorPopups();
 
process.on(  
    "unchaughtException" as any, 
    (error:string) => {
        console.log(error); 
        //handleError(mainWindow)(error);
    }
);    
   


//window.setPosition(x,y) 
//window.getPosition
//window.reload

let initWindow = ()  => {
    const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
      
    Menu.setApplicationMenu(null);  
      
    let handler = new BrowserWindow({   
        icon:path.join(__dirname,'icon.ico'),
        width:width,       
        height:height,   
        title:'Rank',   
        center:true,      
        frame:false,
        backgroundColor:"#0082c8", 
        //show:false      
    });              
              
    handler.setMovable(true); 
    
    handler.on('ready-to-show', () => { 
        handler.show();
    });

    handler.on('closed', () => {handler = null;}); 
   
    //handler.webContents.openDevTools();    
     
    return handler;  
};

  
 
export let initDonationWindow = ()  => {
    //const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
       
    Menu.setApplicationMenu(null);  
      
    let handler = new BrowserWindow({   
        icon:path.join(__dirname,'icon.ico'),
        width:840,       
        height:680,   
        title:'Rank',   
        center:true,      
        frame:true,
        backgroundColor:"#0082c8",
        //show:false       
    });               
    //#0082c8
    //#667db6
    handler.setMovable(true);
 
    handler.on('ready-to-show', () => { 
        handler.show();
    }); 
        
    handler.on('closed', () => {handler = null;}); 
      
       
    return handler;  
};


    
 
app.on(   
    'ready',  
    () => { 
      
      mainWindow = initWindow(); 
      let listeners = new Listeners(); 


      loadApp(mainWindow).then( 
        () => { 
            mainWindow.show(); 
            mainWindow.webContents.send("loaded");
        }
      );  
      
    } 
);    
   
  
    
app.on(
    'window-all-closed', 
    () => {
        if(process.platform !== 'darwin') 
            app.quit();
    }  
);    
  
   
  
  

  
     
 