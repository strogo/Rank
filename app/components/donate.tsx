import { Component } from 'react';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import * as ReactDOM from 'react-dom'; 
import { Animation } from "./animation";

class DonationForm extends Component<any,any>{
    ref:any;

    constructor(props){
         super(props);
    }; 

    componentDidMount(){
        this.ref.submit();
    };  
//https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=GB8QJG9VGJ45Q
    render(){  
      return  <div>  
                <Animation show={true} randomRule=""/>
                <form style={{display:"none"}} ref={e => {this.ref=e}} action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                        <input type="hidden" name="cmd" value="_s-xclick" />
                        <input type="hidden" name="hosted_button_id" value="GB8QJG9VGJ45Q" />
                        <input  
                            style={{border:"0"}} 
                            type="image" 
                            src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
                            name="submit" 
                            alt="PayPal - The safer, easier way to pay online!" 
                        />
                </form>

              </div>
    };  
};


let container = document.createElement("div");
document.body.appendChild(container);

ReactDOM.render(
    < DonationForm />,
    container
);
 