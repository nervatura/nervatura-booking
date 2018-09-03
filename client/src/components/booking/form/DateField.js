import React, { Component } from 'react';
import { connect } from 'react-redux';

import Datetime from 'react-datetime';
import moment from 'moment';

class DateField extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      picker: null
    };
  }
  
  render() {
    const { dispatch, fieldname, onEdit, isValid, isEmpty, index } = this.props;
    let value = this.props.value || "";
    const { datepicker } = this.props.data.store.def
    const { getValidDate, onValueChange, onNumberInput } = this.props.data.actions.tool
    
    if (value.toString().length>=10) {
      value = getValidDate(value);}

    if(this.state.picker === fieldname) {
      return <div >
        <div className="w3-cell w3-cell-middle">
          <Datetime name={fieldname} inputProps={{name:fieldname, maxLength:10, size:10,
          autoFocus:(this.state.picker === fieldname)}}
          value={moment(value,datepicker.dateFormat)} 
          dateFormat={datepicker.dateFormat} timeFormat={false} 
          strictParsing={true} closeOnSelect={true} isValidDate={isValid}
          open={(this.state.picker === fieldname)}
          className="w3-input w3-white w3-center w3-border w3-round" 
          onChange={(value) => dispatch(onEdit( fieldname,
            value.format ? 
              value.format(datepicker.dateFormat) : 
              onValueChange({fieldtype:"date", empty:isEmpty || 'false'},value), index ))}
          onBlur={(value) => {
            this.setState({"picker": null });}}/>
        </div>
        <div className="w3-cell w3-cell-middle" style={{width:35}}>
          <button className="w3-white w3-border w3-hover-grey" 
            style={{height:34, cursor: 'pointer' }}
            onClick={() => { this.setState({ "picker": null }); }}>
            <i className={"fa fa-calendar fa-fw"} aria-hidden="true"></i><br/>
          </button>
        </div>
      </div>
    } 
    else {
      return <div >
        <div className="w3-cell w3-cell-middle">
          <input name={fieldname} className="w3-input w3-center w3-border w3-rest" 
            value={value}
            type="text" maxLength="10" size="10"
            onChange={(event) => dispatch(onEdit( fieldname,
              onNumberInput({fieldtype:"date"}, event.target.value), index ))}
            onBlur={(event) => dispatch(onEdit( fieldname,
              onValueChange({fieldtype:"date", empty:isEmpty || 'false'}, event.target.value), index ))} />
        </div>
        <div className="w3-cell w3-cell-middle" style={{width:35}}>
          <button className="w3-white w3-border w3-hover-grey" 
            style={{height:34, cursor: 'pointer' }}
            onClick={() => { this.setState({ "picker": fieldname }); }}>
            <i className={"fa fa-calendar fa-fw"} aria-hidden="true"></i><br/>
          </button>
        </div>
      </div>
    }
  }
}

export default connect((state)=>{return {data: state}})(DateField);