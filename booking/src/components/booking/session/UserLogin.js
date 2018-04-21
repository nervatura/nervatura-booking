import React, { Component } from 'react';
import { connect } from 'react-redux';

import firebase from 'firebase';

class UserLogin extends Component {
  render() {
    const { dispatch } = this.props
    const { getText, appData } = this.props.data.actions.app
    const { country, country_code } = this.props.data.store.server.settings
    return (
      <div id="login">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_login_title'))).toUpperCase()}</h3>
          </div>
        </div>
        <div className="w3-center w3-margin-top w3-margin-bottom" >
          <a className="w3-button w3-white w3-text-gray w3-border w3-round-xxlarge" 
            style={{width:220}}
            onClick={ (event) => {
              var provider = new firebase.auth.GoogleAuthProvider();
              firebase.auth().signInWithRedirect(provider);
              localStorage.setItem("redirect", "1"); }}>
            <div className="w3-cell-row" >
              <div className="w3-cell w3-cell-middle" >
                <i className="fa fa-google fa-2x" aria-hidden="true"></i>
              </div>
              <div className="w3-cell w3-cell-middle" style={{paddingLeft:6}} >
                <span className="font-bold">{dispatch(getText('booking_login_sign_in_google'))}</span>
              </div>
            </div>
          </a>
        </div>
        <div className="w3-center w3-margin-bottom" >
          <a className="w3-button w3-text-white w3-border w3-round-xxlarge" 
            style={{backgroundColor:"#3b5998", width:220}} 
            onClick={ (event) => {
              var provider = new firebase.auth.FacebookAuthProvider();
              firebase.auth().signInWithRedirect(provider);
              localStorage.setItem("redirect", "1"); }}>
            <div className="w3-cell-row" >
              <div className="w3-cell w3-cell-middle" >
                <i className="fa fa-facebook-official fa-2x" aria-hidden="true"></i>
              </div>
              <div className="w3-cell w3-cell-middle" style={{paddingLeft:6}} >
                <span className="font-bold">{dispatch(getText('booking_login_sign_in_facebook'))}</span>
              </div>
            </div>
          </a>
        </div>
        <div className="w3-center w3-margin-bottom" >
          <a className="w3-button w3-text-white w3-border w3-round-xxlarge" 
            style={{backgroundColor:"#CDB3A3", width:220}} 
            onClick={ (event) => {
               dispatch(appData("modal", {
                type: "login", login_type: "email", login_state: "email_check",
                login_email: localStorage.getItem("last_email") || ""
              }))
            }}>
            <div className="w3-cell-row" >
              <div className="w3-cell w3-cell-middle" >
                <i className="fa fa-envelope fa-2x" aria-hidden="true"></i>
              </div>
              <div className="w3-cell w3-cell-middle" style={{paddingLeft:6}} >
                <span className="font-bold">{dispatch(getText('booking_login_sign_in_email'))}</span>
              </div>
            </div>
          </a>
        </div>
        <div className="w3-center" >
          <a className="w3-button w3-text-white w3-border w3-round-xxlarge" 
            style={{backgroundColor:"#908585", width:220}} 
            onClick={ (event) => {
              const ccode = country_code.filter(function(row){
                return (row.key === String(country).toLowerCase());})[0];
              dispatch(appData("modal", {
                type: "login", login_type: "phone", login_state: "phone_login",
                country_code: ccode.code, login_phone: localStorage.getItem("last_phone") || ""
              }))
            }}>
            <div className="w3-cell-row" >
              <div className="w3-cell w3-cell-middle" >
                <i className="fa fa-phone fa-2x" aria-hidden="true"></i>
              </div>
              <div className="w3-cell w3-cell-middle" style={{paddingLeft:6}} >
                <span className="font-bold">{dispatch(getText('booking_login_sign_in_phone'))}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  }
}

export default connect((state)=>{return {data: state}})(UserLogin);