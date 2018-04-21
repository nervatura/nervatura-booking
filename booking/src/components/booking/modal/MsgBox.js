import React, { Component } from 'react';
import { connect } from 'react-redux';

class MsgBox extends Component {
  render() {
    const { dispatch } = this.props
    const { getText, appData } = this.props.data.actions.app
		const { msg_icon, msg_title, msg_text, msg_cancel } = this.props.data.store.modal;
    let icon = "fa fa-exclamation-triangle fa-fw"
    switch (msg_icon){
      case "exclamation":
        icon = "fa fa-exclamation-triangle fa-fw"
        break;
      case "info":
        icon = "fa fa-info-circle fa-fw"
        break;
      default:
        break;
    }
    return (
      <div className="w3-modal w3-show">
        <div className="w3-modal-content w3-round" style={{maxWidth: 400, marginTop:50}}>
          <div className="w3-card-4 w3-round w3-light-grey" style={{paddingBottom: 12}}>
            <div className="w3-container w3-padding w3-black">
              <i className={icon} aria-hidden="true"></i>&nbsp;
              <label>{msg_title}</label>
            </div>
            <div className="w3-container w3-padding-16 w3-white">
              { (msg_text && msg_text !== '') ? <p><label>{msg_text}</label></p> : '' }
            </div>
            <div className="w3-container" style={{paddingTop: 12}}>
              {(() => {
                if(msg_cancel){
                  return (
                    <div className="w3-row w3-center">
                      <div className="w3-row-padding">
                        <div className="w3-half w3-padding-small">
                          <button className="w3-button w3-white w3-border w3-block"
                            onClick={() => { dispatch(appData("modal", { type: "" })); }}>
                            <i className="fa fa-times fa-fw" aria-hidden="true"></i><b>{dispatch(getText("msg_cancel"))}</b></button>
                        </div>
                        <div className="w3-half w3-padding-small">
                          <button autoFocus={true} 
                            className="w3-button w3-white w3-border w3-block" 
                            onClick={() => { dispatch(appData("modal", { type: "" })); msg_cancel(); }}>
                            <i className="fa fa-check fa-fw" aria-hidden="true"></i><b>{dispatch(getText("msg_ok"))}</b></button>
                        </div>
                      </div>
                    </div>)}
                else {
                  return(
                    <div className="w3-row w3-center">
                      <button autoFocus={true} 
                        className="w3-button w3-white w3-border font-bold" 
                        onClick={() => { dispatch(appData("modal", { type: "" })); }}>
                        <i className="fa fa-check fa-fw" aria-hidden="true"></i>{dispatch(getText("msg_ok"))}</button>
                    </div>)}
              })()}
            </div>
          </div>
        </div>
			</div>
    )
  }
}

export default connect((state)=>{return {data: state}})(MsgBox);