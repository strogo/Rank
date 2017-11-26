import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, addIndex, range, merge, isEmpty, curry, cond, compose, contains, mergeAll,
    and, clone, assocPath, equals, find, splitEvery, flatten, defaultTo, split, filter, take, drop } from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { InputActions, inputReducer } from "./input";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import { vectorSpaceReducer } from "../3d/vectorSpaceReducer";

const defaultAppState = {
    interfaceColor:"rgb(48,48,48)",
    layout:"horizontal"     
};   
     
export let appReducer = (state=defaultAppState, action) => { 
    let newState = clone(state); 
          
    return cond([    
            [       
                equals("interfaceColor"),   
                () => assocPath(["interfaceColor"], action.load.hex, newState) 
            ],
            /*[            
                equals("layout"),    
                () => assocPath(["layout"], action.load, newState) 
            ],*/  
            [ () => true, () => newState]
    ])(action.type);  
};

let reducer = combineReducers({inputReducer,vectorSpaceReducer,appReducer}); 
//let middleware = applyMiddleware(createLogger());     
export let store = createStore(reducer);  