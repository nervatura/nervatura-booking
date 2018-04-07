import React, { Component } from 'react';
import { connect } from 'react-redux';

class HomePage extends Component {
  render() {
    const { dispatch } = this.props
    const { getText } = this.props.data.actions.app
    const { url } = this.props.data.store
    const getLang = (value) => {
      return dispatch(getText(value));}
    return (
      <div id="home" >

        <div className="w3-card-2 w3-section w3-light-grey w3-round">
          <div className="w3-content w3-container padding-xlarge" >
            <h3 className="w3-center text_shadow w3-bottombar">{getLang('home_title')}</h3>
            <p>{getLang('home_body_1')}</p>
            <ul className="fa-ul">
              <li className="padding-0" style={{border:0}}>
                <i className="fa-li fa fa-check-circle-o w3-text-green" style={{paddingTop:2}} ></i>
                <span>{dispatch(getText('home_body_l1'))}</span>
              </li>
              <li className="padding-0" style={{border:0}}>
                <i className="fa-li fa fa-check-circle-o w3-text-green" style={{paddingTop:2}} ></i>
                <span>{dispatch(getText('home_body_l2'))}</span> (<a className="w3-text-blue-grey w3-hover-text-blue"
                  href={url.routes_api} target="_blank" >routes/api.js</a>)
              </li>
              <li className="padding-0" style={{border:0}}>
                <i className="fa-li fa fa-check-circle-o w3-text-green" style={{paddingTop:2}} ></i>
                <span>{dispatch(getText('home_body_l3'))}</span> (<a className="w3-text-blue-grey w3-hover-text-blue"
                  href={url.react_ui} target="_blank" >React UI</a>)
              </li>
              <li className="padding-0" style={{border:0}}>
                <i className="fa-li fa fa-check-circle-o w3-text-green" style={{paddingTop:2}} ></i>
                <span>{dispatch(getText('home_body_l4'))}</span> (<a className="w3-text-blue-grey w3-hover-text-blue"
                  href={url.firebase_auth} target="_blank" >Firebase Authentication</a> &amp; <a className="w3-text-blue-grey w3-hover-text-blue"
                  href={url.web_token} target="_blank" >JSON Web Token</a>)
              </li>
              <li className="padding-0" style={{border:0}}>
                <i className="fa-li fa fa-check-circle-o w3-text-green" style={{paddingTop:2}} ></i>
                <span>{dispatch(getText('home_body_l5'))}</span> (<a className="w3-text-blue-grey w3-hover-text-blue"
                  href={url.paytrail} target="_blank" >Paytrail</a>)
              </li>
            </ul>
            <div className="w3-center" >
              <i className="fa fa-cog fa-spin fa-3x fa-fw w3-text-blue-grey" ></i>
            </div>
            <div className="w3-center" >
                <a className="font-bold w3-text-blue-grey w3-hover-text-blue"
                  href={url.github} target="_blank" >{getLang('home_body_2')}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state)=>{return {data: state}})(HomePage);