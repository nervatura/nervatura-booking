import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
//import ReactGA from 'react-ga';
//onClick={() => { ReactGA.event({category: 'menu', action: 'framework'});}}

class NavBar extends Component {
  render() {
    const { dispatch } = this.props
    const { setLang, getText, appState, getValidView, setPageView, cancelData, createOrder } = this.props.data.actions.app
    const { signOut, saveData } = this.props.data.actions.api
    const { locales } = this.props.data.store.def
    const { lang, top_icon, menu } = this.props.data.store.state
    const { img, booking } = this.props.data.store
    const getMenu = (value) => {
      if (menu === value){
        return "w3-show";} 
      else {
        return ""}}
    const setMenu = (value) => {
      if(!value || (menu === value)) {
        dispatch(appState("menu", null));}
      else {
        dispatch(appState("menu", value));}}
    const getButtonStyle = (value) => {
      if((value === "lang") && top_icon){
        return "w3-hide";}
      else if((value === "top") && !top_icon){
        return "w3-hide";}
      else if (menu === value){
        return "w3-grey";} 
      else {
        return ""}}
    const getLangIcon = (value) => {
      if(value === "en")
        return <img src={img.flag_blank} className="flag flag-gb" alt="" />
      else
        return <img src={img.flag_blank} className={"flag flag-"+value} alt="" />}
    const getLang = (value) => {
      return dispatch(getText(value));}
    const getUserButton = () => {
      if (window.location.hash === "#/booking") {
        switch (dispatch(getValidView())) {
          case "verification":
          case "customer":
            return(
              <button 
                className="font-bold w3-bar-item w3-button w3-right"  
                onClick={() => { dispatch(signOut()); }} 
                title={getLang('menu_logout')}><i className="fa fa-power-off fa-fw w3-text-red"></i>
                <span className="w3-hide-small">{getLang('menu_logout')}</span>
              </button>)
          case "search":
            return (
              <button 
                className="font-bold w3-bar-item w3-button w3-right"  
                onClick={(event) => dispatch(setPageView({ view:"login" })) } 
                title={getLang('menu_login')}><i className="fa fa-user fa-fw"></i>{getLang('menu_login')}
              </button>)
          case "login":
            return (
              <button 
                className="font-bold w3-bar-item w3-button w3-right"  
                onClick={(event) => dispatch(setPageView({ view:"search" })) } 
                title={getLang('menu_search')}><i className="fa fa-search fa-fw"></i>{getLang('menu_search')}
              </button>)
          default:
            return null; }
      }
      else {
        return (
          <Link replace to="/booking" 
            className="font-bold w3-bar-item w3-button w3-right"
            onClick={() => { setMenu(null); dispatch(setPageView({ view:"booking" })); }}>
            <i className="fa fa-calendar-check-o" aria-hidden="true"></i> {getLang('menu_book_now')}</Link>); 
      }
    }
    const getUserMenu = () => {
      if(!booking.login.data.customer.id){return (
        <div>
          <button 
            className="font-bold w3-bar-item w3-button"  
            onClick={(event) => dispatch(saveData(booking.view)) } 
            title={getLang('booking_agreement_label')}><i 
            className="fa fa-check-square-o fa-fw w3-text-green"></i>{getLang('booking_agreement_label').toLocaleUpperCase()}
          </button>
          <button 
            className="font-bold w3-bar-item w3-button w3-right"  
            onClick={() => { dispatch(signOut()); }} 
            title={getLang('menu_logout')}><i className="fa fa-power-off fa-fw w3-text-red"></i>
            <span className="w3-hide-small">{getLang('menu_logout')}</span>
          </button>
        </div>)
      }
      else if(booking.view === "order"){
        return (
          <div>
            <button 
              className="font-bold w3-bar-item w3-button"  
              onClick={(event) => dispatch(createOrder()) } 
              title={getLang('menu_save')}><i 
              className="fa fa-check-circle-o fa-fw w3-text-green"></i>{getLang('menu_pay')}
            </button>
            <button 
              className="font-bold w3-bar-item w3-button"  
              onClick={(event) => dispatch(cancelData()) } 
              title={getLang('menu_cancel')}><i 
              className="fa fa-times-circle-o fa-fw w3-text-grey"></i>{getLang('menu_cancel')}
            </button>
         </div>
        );
      }
      else if(booking.login.data.dirty){
        return (
          <div>
            <button 
              className="font-bold w3-bar-item w3-button"  
              onClick={(event) => dispatch(saveData(booking.view)) } 
              title={getLang('menu_save')}><i 
              className="fa fa-check-circle-o fa-fw w3-text-green"></i>{getLang('menu_save')}
            </button>
            <button 
              className="font-bold w3-bar-item w3-button"  
              onClick={(event) => dispatch(cancelData()) } 
              title={getLang('menu_cancel')}><i 
              className="fa fa-times-circle-o fa-fw w3-text-grey"></i>{getLang('menu_cancel')}
            </button>
         </div>
        );
      }
      else {
        return (
          <button 
            className={"w3-bar-item w3-button "+getButtonStyle("sidebar")}  
            onClick={() => { setMenu("sidebar") }}><i 
            className="fa fa-bars fa-fw"></i><span>{booking.login.data.customer.custname}</span>
          </button>
        );
      }
    }
    if((window.location.hash === "#/booking") && booking.login.data.customer){return (
      <div className="w3-top">
        <div className="w3-bar w3-card-2 w3-animate-opacity w3-light-grey">
          {getUserMenu()}
          <button 
            className="font-bold w3-bar-item w3-button w3-right"  
            onClick={() => { dispatch(signOut()); }} 
            title={getLang('menu_logout')}><i className="fa fa-power-off fa-fw w3-text-red"></i>
            <span className="w3-hide-small">{getLang('menu_logout')}</span>
          </button>
          <button 
            className={"w3-bar-item w3-button w3-right top_button-padding "+getButtonStyle("top")} 
            onClick={() => { window.scrollTo(0,0); }}><i className="fa fa-arrow-up top_icon-border"></i>
          </button>
        </div>
        <div className={"w3-sidebar w3-hide w3-card-2 "+getMenu("sidebar")} style={{width:270}}>
          <ul className="w3-ul w3-bar-block" style={{marginBottom:48}}>
            <li className="w3-bar-item padding-0 w3-light-grey ">
              <Link replace to="/home" className="w3-bar-item w3-button" 
                onClick={() => { setMenu(null) }}>
                  <i className="fa fa-home fa-fw" aria-hidden="true"></i>&nbsp;{getLang('menu_home')}</Link></li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"customer" })); setMenu(null);} }>
                  <i className="fa fa-user fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_customer_title')}</a>
            </li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"search" })); setMenu(null);} }>
                  <i className="fa fa-search fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_search_title')}</a>
            </li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"history" })); setMenu(null);} }>
                  <i className="fa fa-calendar fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_history_title')}</a>
            </li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"packages" })); setMenu(null);} }>
                  <i className="fa fa-ticket fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_packages_title')}</a>
            </li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"oitems" })); setMenu(null);} }>
                  <i className="fa fa-cart-plus fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_oitems_title')}</a>
            </li>
            <li className="w3-bar-item padding-0 w3-border-top">
              <a className="w3-bar-item w3-button"  
                onClick={(event) => {dispatch(setPageView({ view:"invoices" })); setMenu(null);} }>
                  <i className="fa fa-file-text-o fa-fw" aria-hidden="true"></i>&nbsp;{getLang('booking_invoices_title')}</a>
            </li>
          </ul>
        </div>
      </div>
    )}
    else {return (
      <div className="w3-top">
        <div className="w3-bar w3-card-2 w3-animate-opacity w3-grey">
          <Link replace to="/home" className="w3-bar-item w3-button font-bold" 
            onClick={() => { setMenu(null) }}>
              <i className="fa fa-home fa-fw" aria-hidden="true"></i>&nbsp;{getLang('menu_home')}</Link>
          {getUserButton()}
          <div className="w3-dropdown-click w3-right">
            <button className={"font-bold w3-button "+getButtonStyle("lang")} 
              onClick={() => { setMenu("lang") }} >
              {getLangIcon(lang)} {lang.toUpperCase()}</button>
            <div className={"w3-dropdown-content w3-bar-block w3-card-2 "+getMenu("lang")} style={{minWidth:60}}>
              {Object.keys(locales).map(_lang =>
                <button key={_lang} className="w3-bar-item w3-button"
                  onClick={() => { 
                    dispatch(setLang(_lang)); 
                    setMenu(null) }}>
                  {getLangIcon(_lang)} {_lang.toUpperCase()}</button> )}
            </div>
          </div>
          <button 
            className={"w3-bar-item w3-button w3-right top_button-padding "+getButtonStyle("top")} 
            onClick={() => { window.scrollTo(0,0); }}><i className="fa fa-arrow-up top_icon-border"></i>
          </button>
        </div>
      </div>
    )}
  }
}

export default connect((state)=>{return {data: state}})(NavBar);