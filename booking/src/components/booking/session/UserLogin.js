import React, { Component } from 'react';
import { connect } from 'react-redux';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import firebaseui from 'firebaseui';

class UserLogin extends Component {
  constructor(props) {
    super(props);
    
    const { country } = this.props.data.store.server.settings
    this.state = {
      uiConfig: {
        credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
        signInOptions: [
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
          },
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            recaptchaParameters: {
              type: 'image', // 'audio'
              size: 'normal', // 'invisible' or 'compact'
              badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
            },
            defaultCountry: country
          }
        ]
      }
    };
  }
  
  render() {
    const { dispatch } = this.props
    const { getText } = this.props.data.actions.app
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
            <i className="fa fa-google fa-fw" aria-hidden="true"></i>&nbsp;
            <span className="font-bold">{dispatch(getText('booking_login_sign_in'))} Google</span></a>
        </div>
        <div className="w3-center" >
          <a className="w3-button w3-text-white w3-border w3-round-xxlarge" 
            style={{backgroundColor:"#3b5998", width:220}} 
            onClick={ (event) => {
              var provider = new firebase.auth.FacebookAuthProvider();
              firebase.auth().signInWithRedirect(provider);
              localStorage.setItem("redirect", "1"); }}>
            <i className="fa fa-facebook-official fa-fw" aria-hidden="true"></i>&nbsp;
            <span className="font-bold">{dispatch(getText('booking_login_sign_in'))} Facebook</span></a>
        </div>
        <StyledFirebaseAuth uiConfig={this.state.uiConfig} firebaseAuth={firebase.auth()}/>
      </div>
    );
  }
}

export default connect((state)=>{return {data: state}})(UserLogin);