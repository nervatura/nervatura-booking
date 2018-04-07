import React, { Component } from 'react';
import { connect } from 'react-redux';

class EmailVerified extends Component {
  render() {
    const { dispatch } = this.props
    const { getText } = this.props.data.actions.app
    const { sendVerification } = this.props.data.actions.api
    const { uid } = this.props.data.store.booking.login.data
    return(
      <div id="verified">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="w3-center text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_verification_title'))).toUpperCase()}</h3>
          </div>
        </div>
        <p>{dispatch(getText('booking_verification_1'))} <span className="font-bold" >{uid}</span> </p>
        <p>{dispatch(getText('booking_verification_2'))}</p>
        <div className="w3-padding w3-center">
          <a className="w3-button w3-white w3-border" 
            style={{padding:12}}
            onClick={() => dispatch(sendVerification()) }>
              <i className="fa fa-envelope fa-fw" aria-hidden="true"></i>&nbsp;
              <b>{dispatch(getText('booking_verification_send'))}</b></a>
        </div>
      </div>
    )
  }
}

export default connect((state)=>{return {data: state}})(EmailVerified);