import React, { Component } from 'react';
import { connect } from 'react-redux';

import MsgBox from './MsgBox';
import SpinnerBox from './SpinnerBox';

class ModalBox extends Component {
  render() {
    const { state, modal } = this.props.data.store;
    if(localStorage.getItem("redirect") === "1"){
      return <SpinnerBox />; }
    else if(state.request_sending){
      return <SpinnerBox />; }
    else {
      switch (modal.type) {
        case "msg":
          return <MsgBox />;
        default:
          return null; }
    }
  }
}

export default connect((state)=>{return {data: state}})(ModalBox);