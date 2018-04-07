import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
//import ReactGA from 'react-ga';

import 'w3-css/w3.css';
import 'react-pagify/style.css';
import 'react-datetime/css/react-datetime.css';
import 'font-awesome/css/font-awesome.css';
import '../config/style/fonts.css';
import '../config/style/flags.css';
import '../config/style/index.css';

import NavBar from './NavBar';
import HomePage from './HomePage';

import BookingPage from './booking/BookingPage';
import PaymentPage from './booking/PaymentPage';
import ModalBox from './booking/modal/ModalBox';

class AppPage extends Component {
  
  constructor(props) {
    super();
    
    const { getSettings, initAuth } = props.data.actions.api
    props.dispatch(getSettings((err) => {
      if(!err) {
        props.dispatch(initAuth()); }}));
    
    this.state = {
      width: 0,
      height: 0,
    }
    this.onScroll = this.onScroll.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.setScroll = this.setScroll.bind(this);
    //ReactGA.initialize(server.settings.google_analytics);
    //ReactGA.pageview(window.location.pathname);
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
    window.addEventListener("hashchange", this.setScroll.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
    window.removeEventListener("hashchange", this.setScroll.bind(this));
    window.removeEventListener("scroll", this.onScroll.bind(this));
  }
  onScroll() {
    const { dispatch } = this.props
    const { appState } = this.props.data.actions.app
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      dispatch(appState("top_icon", true));} 
    else {
      dispatch(appState("top_icon", false));}
  }
  updateDimensions() {
    this.setState({ height: window.innerHeight });
    this.setState({ width: window.innerWidth });
  }
  setScroll() {
    window.scrollTo(0,0);
  }
  render() {
    return (
      <div>
        <Router>
          <div ref='main' >
            <NavBar />
            <div className="w3-content" style={{marginTop:44, paddingTop:5}}>
              <Switch>
                <Route exact path={'/'} component={HomePage} />
                <Route exact path={'/home'} component={HomePage} />
                
                <Route exact path={'/booking'} component={BookingPage} />
                <Route exact path={'/booking/payment'} component={PaymentPage} />

                <Redirect to="/" />
              </Switch>
            </div>
          </div>
        </Router>
        <ModalBox />
      </div>
    );
  }
}

export default connect((state)=>{return {data: state}})(AppPage);