var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');   
var CopyWebpackPlugin = require('copy-webpack-plugin');      
   
module.exports = {     
    entry: {    
        'app':'./app/components/app.tsx',
        'error':"./app/components/error.tsx",
        "donate":"./app/components/donate.tsx"
    },                                 
    output: {            
        filename : '[name].js' , 
        path : path.resolve(__dirname,"dist") 
    },     
     
    resolve: { 
        extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    }, 
                  
    module: { 
        rules: [ 
          {   
            test: /\.(css|scss)$/,   
            use: [ 'style-loader', 'css-loader']
          },  
          {  
            test:/\.(ts|tsx)?$/,  
            exclude: path.resolve(__dirname,'node_modules'), 
            loader:"awesome-typescript-loader"
          },      
          {   
            test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
            loader: 'file-loader' 
          },    
          {    
            enforce:"pre",  
            test:/\.js$/,       
            exclude: path.resolve(__dirname,'node_modules'), 
            loader: 'babel-loader',
            query: {presets: ['es2015', 'react']}  
          }     
        ]    
    },
    
    target:'electron', 
        
    plugins :[
        new CopyWebpackPlugin([{ 
            from : './app/assets' 
        }]),   
        new HtmlWebpackPlugin({
            inject:true, 
            title:'Rank',     
            chunks:['app'],
            filename: 'app.html' 
        }),  
        new HtmlWebpackPlugin({
            inject:true, 
            title:'Error',     
            chunks:['error'],
            filename: 'error.html' 
        }),   
        new HtmlWebpackPlugin({
            inject:true, 
            title:'Donate',     
            chunks:['donate'],
            filename: 'donate.html' 
        })     
    ],  
    
    node: { 
        __dirname: false, 
        __filename: false
    }       
};
 
   