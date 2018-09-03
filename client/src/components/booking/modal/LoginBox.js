import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';

class LoginBox extends Component {
  componentDidMount() {
    const { dispatch } = this.props
    const { phoneLogin } = this.props.data.actions.api
    if(this.refs.sign_in){
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign_in', {
        'size': 'invisible',
        'badge': 'bottomleft',
        'callback': function(response) { 
          dispatch(phoneLogin()); }
      });
      window.recaptchaVerifier.render().then(function(widgetId) {
        window.recaptchaWidgetId = widgetId;
      });
      if (typeof grecaptcha !== 'undefined' && typeof window.recaptchaWidgetId !== 'undefined') {
        window.grecaptcha.reset(window.recaptchaWidgetId); }
    }
    
  }
  render() {
    const { dispatch } = this.props
    const { getText, appData } = this.props.data.actions.app
    const { emailLogin, emailCreate, resetPassword, phoneVerify } = this.props.data.actions.api
    const { onNumberInput, onValueChange } = this.props.data.actions.tool
    const { country_code } = this.props.data.store.server.settings;
		let modal = this.props.data.store.modal;
    const login_icon = (modal.login_type === "email") ? "fa fa-envelope fa-fw" : "fa fa-phone fa-fw"
    const login_title = () => {
      switch (modal.login_state) {
        case "email_check":
        case "email_login":
          return dispatch(getText("booking_login_sign_in_email"));
        
        case "email_create":
          return dispatch(getText("booking_login_create_account"));
        
        case "reset_password":
          return dispatch(getText("booking_login_recover_password"));
      
        case "phone_login":
          return dispatch(getText("booking_login_phone_login"));
        
        case "phone_verify":
          return dispatch(getText("booking_login_phone_verify"));

        default:
          return ""; }}
    const login_body = () => {
      switch (modal.login_state) {
        case "email_check":
          return(
            <div>
              <label className="title_font" >{dispatch(getText('booking_login_email'))}</label>
              <input type="email" className="w3-input w3-border w3-round" 
                value={modal.login_email||''} autoFocus={true}
                onChange={(event) => {
                  modal.login_email = event.target.value;
                  modal.validationMessage = event.target.validationMessage;
                  dispatch(appData("modal", modal)) }}/>
            </div>)
          
          case "email_create":
          case "email_login":
          return(
            <div>
              <div>
                <label className="title_font" >{dispatch(getText('booking_login_email'))}</label>
                <input type="email" className="w3-input w3-border w3-round" 
                  value={modal.login_email||''} disabled="disabled" />
              </div>
              <div style={{paddingTop: 12}}>
                <label className="title_font" >{(modal.login_state === "email_create") ? dispatch(getText('booking_login_choose_password')) : dispatch(getText('booking_login_password'))}</label>
                <input type="password" className="w3-input w3-border w3-round" 
                  value={modal.login_password||''} autoFocus={true}
                  onChange={(event) => {
                    modal.login_password = event.target.value;
                    modal.validationMessage = event.target.validationMessage;
                    dispatch(appData("modal", modal)) }}/>
              </div>
              {(() => {
                if(modal.login_state === "email_login"){
                  return(
                    <div style={{paddingTop: 12}}>
                      <button className="w3-button w3-text-blue-grey w3-hover-white w3-hover-text-blue font-bold padding-0" 
                        onClick={() => { 
                        modal.login_state = "reset_password";
                        dispatch(appData("modal", modal)) }} >
                        <i className="fa fa-medkit fa-fw" aria-hidden="true"></i>&nbsp;{dispatch(getText('booking_login_trouble'))}</button>
                    </div>)
                }
              })()}
            </div>)
          
          case "reset_password":
          return(
            <div>
              <div>
                <label className="title_font" >{dispatch(getText('booking_login_email'))}</label>
                <input type="email" className="w3-input w3-border w3-round" 
                  value={modal.login_email||''} disabled="disabled" />
              </div>
              <div className="w3-container w3-padding w3-sand w3-text-blue-grey title_font w3-margin-top w3-round">
                <div className="w3-cell w3-cell-middle" style={{width: 50}} >
                  <i className="fa fa-info-circle fa-fw fa-2x" aria-hidden="true"></i>
                </div>
                <div className="w3-cell w3-cell-middle" >
                  <label>{dispatch(getText('booking_login_recover_info'))}</label>
                </div>
              </div>
            </div>)
        
        case "phone_login":
          return(
            <div>
              <div>
                <label className="title_font" >{dispatch(getText('booking_login_phone_number'))}</label>       
                <div className="w3-cell-row" >
                  <div className="w3-cell w3-cell-middle" style={{width:70}} >
                    <select className="w3-select w3-border w3-round" value={modal.country_code} 
                      style={{backgroundColor:"white"}}
                      onChange={(event) => {
                        modal.country_code = event.target.value;
                        dispatch(appData("modal", modal)) }} >
                        {country_code.map((country, index) =>
                          <option key={index} value={country.code} >{country.code}</option>)}
                    </select>
                  </div>
                  <div className="w3-cell w3-cell-middle">
                    <input type="text" className="w3-input w3-border w3-round" 
                      value={modal.login_phone||''} autoFocus={true} 
                      onChange={(event) => {
                        modal.login_phone = onNumberInput({fieldtype:"integer"}, event.target.value)||"";
                        dispatch(appData("modal", modal)); }} 
                      onBlur={(event) => {
                        modal.login_phone = onValueChange({fieldtype:"integer"}, event.target.value)||"";
                        dispatch(appData("modal", modal)); }}/>
                  </div>
                </div>
              </div>
              <div className="w3-container w3-padding w3-sand w3-text-blue-grey title_font w3-margin-top w3-round">
                <div className="w3-cell w3-cell-middle" style={{width: 50}} >
                  <i className="fa fa-info-circle fa-fw fa-2x" aria-hidden="true"></i>
                </div>
                <div className="w3-cell w3-cell-middle" >
                  <label>{dispatch(getText('booking_login_phone_number_info'))}</label>
                </div>
              </div>
            </div>)
          
          case "phone_verify":
          return(
            <div>
              <div>
                <label className="title_font" >{dispatch(getText('booking_login_phone_code'))}</label>       
                <input type="text" className="w3-input w3-border w3-round" 
                  value={modal.login_code||''} autoFocus={true}
                  onChange={(event) => {
                    modal.login_code = event.target.value;
                    modal.validationMessage = event.target.validationMessage;
                    dispatch(appData("modal", modal)) }}/>
              </div>
              <div className="w3-container w3-padding w3-sand w3-text-blue-grey title_font w3-margin-top w3-round">
                <div className="w3-cell w3-cell-middle" style={{width: 50}} >
                  <i className="fa fa-info-circle fa-fw fa-2x" aria-hidden="true"></i>
                </div>
                <div className="w3-cell w3-cell-middle" >
                  <label>{dispatch(getText('booking_login_phone_verify_info'))}&nbsp;{modal.phone_number||""}</label>
                </div>
              </div>
            </div>)
      
        default:
          return null; }}
    const login_error = () => {
      if(modal.errorMessage && modal.errorMessage !== ""){
        return(
        <div className="w3-container w3-padding w3-sand w3-text-red title_font font-bold w3-margin-top w3-round">
          <div className="w3-cell w3-cell-middle" style={{width: 50}} >
            <i className="fa fa-exclamation-triangle fa-fw fa-2x" aria-hidden="true"></i>
          </div>
          <div className="w3-cell w3-cell-middle" >
            <label>{modal.errorMessage || ""}</label>
          </div>
        </div>) }
      else {
        return null; }}
    const login_button = () => {
      switch (modal.login_state) {
        case "email_check":
          return <button
            className="w3-button w3-white w3-border w3-block font-bold" 
            onClick={() => { dispatch(emailLogin()); }}>
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_next"))}</button>
        
        case "email_login":
          return <button
            className="w3-button w3-white w3-border w3-block font-bold" 
            onClick={() => { dispatch(emailLogin()); }}>
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_sign"))}</button>
        
        case "email_create":
          return <button
            className="w3-button w3-white w3-border w3-block font-bold" 
            onClick={() => { dispatch(emailCreate()); }}>
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_sign"))}</button>
        
        case "reset_password":
          return <button
            className="w3-button w3-white w3-border w3-block font-bold" 
            onClick={() => { dispatch(resetPassword()); }}>
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_send"))}</button>
        
        case "phone_login":
          return <button id="sign_in" ref="sign_in"
            disabled={(window.recaptchaWidgetId) ? "" : "disabled"}
            className="w3-button w3-white w3-border w3-block font-bold" >
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_verify"))}</button>
        
        case "phone_verify":
          return <button
            className="w3-button w3-white w3-border w3-block font-bold" 
            onClick={() => { dispatch(phoneVerify()); }}>
            <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("booking_login_continue"))}</button>

        default:
          return null;
      }
    }
    return (
      <div className="w3-modal w3-show">
        <div className="w3-modal-content w3-round" style={{maxWidth: 400, marginTop:50}}>
          <div className="w3-card-4 w3-round w3-light-grey" style={{paddingBottom: 12}}>
            <div className="w3-container w3-padding w3-black title_font font-bold">
              <i className={login_icon} aria-hidden="true"></i>&nbsp;&nbsp;
              <label>{login_title()}</label>
            </div>
            <div className="w3-container w3-padding-16 title_font w3-white">
              {login_body()}
              {login_error()}
            </div>
            <div className="w3-container" style={{paddingTop: 12}}>
              <div className="w3-row w3-center">
                <div className="w3-row-padding">
                  <div className="w3-half w3-padding-small">
                    <button className="w3-button w3-white w3-border w3-block font-bold"
                      onClick={() => { dispatch(appData("modal", { type: "" })); }}>
                      <i className="fa fa-times fa-fw" aria-hidden="true"></i>{dispatch(getText("msg_cancel"))}</button>
                  </div>
                  <div className="w3-half w3-padding-small">
                    {login_button()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
			</div>
    )
  }
}

export default connect((state)=>{return {data: state}})(LoginBox);