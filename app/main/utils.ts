import { compose, map } from 'ramda';
import * as THREE from 'three';
import fs = require('fs');     
import path = require('path');
const publicIp = require('public-ip'); 
let iplocation = require('iplocation');
import { ipcMain, BrowserWindow } from 'electron';
import { mainWindow } from "./main"; 
     
   
//mainWindow.webContents.removeListener('did-finish-load',functionName);
let templateLoader = (
    onDidFinishLoad : Function,  
    onDidFailLoad : Function, 
    window 
) =>   
    (url : string) : Promise<void> => 
        new Promise<void>(     
            (resolve,reject) => { 
                window.loadURL(url);
                window.webContents.once(
                    'did-finish-load',
                    () => { 
                        onDidFinishLoad(resolve);
                    }  
                );  
                
                window.webContents.once(
                    'did-fail-load', 
                    (event,errorCode,errorDescription) => {  
                        onDidFailLoad(reject,errorDescription); 
                    }  
                );       
            } 
        );   
      


export let loadDonate = (window) : Promise<void> =>  
        templateLoader(
            (resolve) => resolve(), 
            (reject, error) => reject(),
            window 
        )(
            `file://${__dirname}/donate.html`
        );        


// window.webContents.send('loadApp',appData)
export let loadApp = (window) : Promise<void> => 
       templateLoader(
           (resolve) => resolve(), 
           (reject, error) => reject(),
           window 
       )(
           `file://${__dirname}/app.html`
       );    
  

export let loadError = (window, error : string) : Promise<void> => 
    templateLoader( 
        (resolve) => {
            window.webContents.send('loadError',error)
            resolve();
        }, 
        (reject, error) => { 
            reject(); 
        }, 
        window 
    )(
        `file://${__dirname}/error.html`
    );

 

export let checkUkraine = (wnd) : Promise<void> => 
    new Promise<void>( 
       (resolve) => {
            publicIp.v4() 
            .then(ip => { 
                iplocation(
                    ip,
                    (error,res) => {
                       if(res.country_code==='UA' && res.country_name==='Ukraine'){
                           
                       }else{ 
                            resolve(); 
                       }
                    }
               )   
            }).catch(
                (e) => resolve() 
            ) 
       }
    ); 



export let log = (info : any) => {
    console.log(info);
    return info;
};  
  

 
export let toFile = (pathName:string,data:string) : Promise<void> => 
    new Promise<void>(
      (resolve,reject) => fs.writeFile(
                            pathName,
                            data,   
                            (err) => err ? reject(err) : resolve()
                          )  
    );   
  




export let readFile = (pathName:string) : Promise<string> => 
    new Promise(
       (resolve,reject) => fs.readFile(
                             pathName,
                             (err,data) => err ? reject(err) : resolve(data as any)
                           )
    );  
     
