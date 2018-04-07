import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'

class PaymentPage extends Component {
  render() {
    const { dispatch } = this.props
    const { getText, setPageView } = this.props.data.actions.app
    const getLang = (value) => {
      return dispatch(getText(value));}
    return(
      <div className="w3-modal-content w3-card-4 w3-animate-zoom w3-margin-bottom">
        <div className="w3-container w3-padding-small w3-black w3-text-white" >
          <i className="fa fa-info-circle fa-2x" aria-hidden="true"></i>&nbsp;
          <span className="font-bold w3-xlarge w3-padding-small">{getLang('booking_payment_title')}</span>
          <Link replace to="/booking" onClick={(event) => dispatch(setPageView({ view: "packages" })) }
            className="w3-hover-text-red w3-right" style={{cursor: 'pointer', paddingTop:6}}
            ><i className="fa fa-window-close fa-fw fa-2x" aria-hidden="true"></i></Link>
        </div>
        <div className="w3-container w3-padding-large w3-medium w3-light-grey">
          <p >{getLang('booking_payment_1')}</p>
          <div>{getLang('booking_payment_2')} <Link 
            replace to="/booking" onClick={(event) => dispatch(setPageView({ view: "invoices" })) }
            className="title_color font-bold" 
            style={{cursor: 'pointer'}}>{getLang('booking_invoices_title')}</Link> {getLang('booking_payment_3')}</div>
          
          <div className="w3-center w3-margin-top">
            <Link replace to="/booking" onClick={(event) => dispatch(setPageView({ view: "packages" })) }
              className="w3-button w3-white w3-border" 
              style={{cursor: 'pointer'}}
              ><i className="fa fa-reply fa-fw" aria-hidden="true"></i> 
              <span className="font-bold">{getLang('booking_login_back')}</span></Link>
          </div>
        </div>
      </div>
    )    
  }
}

export default connect((state)=>{return {data: state}})(PaymentPage);