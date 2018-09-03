import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class Event extends Component {
  render() {
    const { dispatch } = this.props
    const { getText, pageEdit, validValue, addFieldItem, removeFieldItem, setPageView, cancelData, deleteEvent } = this.props.data.actions.app
    const { onNumberInput, onValueChange } = this.props.data.actions.tool
    const { event, fieldvalue, session, edate_packages } = this.props.data.store.booking.login.current
    const { data } = this.props.data.store.booking.login
    const { eventgroup_free_session } = this.props.data.store.booking.login.data.defvalues
    const event_guest = fieldvalue.filter(function(row){
      return ((row.fieldname === "event_guest") && (row.deleted === 0));})[0]
    const current_packages = fieldvalue.filter(function(row){
      return ((row.fieldname === "event_ticket") && (row.deleted === 0));})
    const current_pkey = current_packages.map((row, index) => { return parseInt(row.value, 10); });
    let valid_packages = data.packages.filter(function(row){
      return ((row.valid === true) && (current_pkey.indexOf(row.pkey) === -1) && 
        (edate_packages.indexOf(row.pkey) === -1) && 
        ((!row.expiration) ? true :
        moment(row.expiration, 'YYYY-MM-DD').isSameOrAfter(moment(event.fromdate,'YYYY-MM-DD HH:mm'))));})
    valid_packages.unshift("");
    const free_session = ( eventgroup_free_session === event.eventgroup )
    return(
      <div id="event">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_event_title'))).toUpperCase()}</h3>
          </div>
          <div className="w3-cell" >
            <a className="w3-button w3-right w3-hover-text-red" 
              onClick={ (event) => dispatch(cancelData())  }>
              <i className="fa fa-times-circle fa-fw" aria-hidden="true"></i></a>
            {(() => {
              if(event.id !== null){
                return <a className="w3-button w3-right w3-hover-text-red" 
                  onClick={ (e) => { 
                    dispatch(setPageView({ view:"history" }));
                    dispatch(deleteEvent(event)); } }>
                  <i className="fa fa-trash fa-fw" aria-hidden="true" /></a> }
            })()}
          </div>
        </div>
        <ul className="w3-ul w3-white">
          <li className="w3-padding-small w3-row w3-border-top">
            <div className="w3-third w3-padding-small" >
              <label>{dispatch(getText('booking_event_calnumber'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={event.calnumber||''} 
                disabled="disabled"/>
            </div>
            <div className="w3-third w3-padding-small" >
              <label>{dispatch(getText('booking_event_fromdate'))}</label>
              <input type="text" className="w3-input w3-border w3-round" 
                value={(event.fromdate) ? moment(event.fromdate,'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm') : ''} 
                disabled="disabled"/>
            </div>
            <div className="w3-third w3-padding-small" >
              <label>{dispatch(getText('booking_event_todate'))}</label>
              <input type="text" className="w3-input w3-border w3-round" 
                value={(event.todate) ? moment(event.todate,'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm') : ''} 
                disabled="disabled"/>
            </div>
          </li>
          <li className="w3-padding-small w3-row">
            <div className="w3-third" >
              <div className="w3-cell-row" >
                <div className="w3-cell w3-padding-small" >
                  <label>{dispatch(getText('booking_event_guest'))}</label>
                  <input type="text" className="w3-input w3-border w3-round w3-right-align" 
                    value={(event_guest) ? event_guest.value : "0"} 
                    disabled={(free_session && (event.id === null)) ? "" : "disabled"}
                    onChange={(event) => dispatch(pageEdit("event_guest", 
                      onNumberInput({fieldtype:"integer"}, event.target.value)))} 
                    onBlur={(event) => dispatch(pageEdit("event_guest", 
                      dispatch(validValue("event_guest", onValueChange({fieldtype:"integer"}, event.target.value), session)))) }/>
                </div>
              </div>  
            </div>
            <div className="w3-twothird w3-padding-small" >
              <label>{dispatch(getText('booking_event_description'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={event.description||''} 
                onChange={(event) => dispatch(pageEdit("description", event.target.value))}/>
            </div>
          </li>
          {(() => {
            if(free_session){
              return null; }
            else if((valid_packages.length === 1) && (current_packages.length === 0)){
              return(
                <li className="w3-padding w3-row">
                  <span>{dispatch(getText('booking_event_ticket_missing_1'))}</span> <a 
                    className="font-bold w3-hover-text-blue title_color" 
                    style={{cursor: "pointer", textDecoration: "underline"}}
                    onClick={ (event) => dispatch(setPageView({ view: "oitems" })) }>{dispatch(getText('booking_event_ticket_missing_2'))}</a>
                </li>
              )
            }
            else if((valid_packages.length === 1) && (current_packages.length === 1)){
              return(
                <li className="w3-cell-row padding-0 " >
                  <div className="w3-cell w3-padding w3-left">
                    <label>{dispatch(getText('booking_event_ticket'))}</label>
                  </div>
                  <div className="w3-cell w3-left">
                    {current_packages.map((row, index) =>
                      <div className="w3-cell w3-padding w3-left w3-text-grey" key={index}>{row.notes}</div>
                    )}
                  </div>
                </li>)
            }
            else if(((valid_packages.length === 1) && (current_packages.length > 0)) || (event.id !== null)){
              const cmd_del = (index) => {
                if(event.id === null)  
                  return <span className="w3-hover-text-red"
                    onClick={ () => dispatch(removeFieldItem("event_ticket", index)) } style={{cursor: 'pointer'}}><i 
                    className="fa fa-times-circle fa-fw" aria-hidden="true"></i></span>
                else
                  return null; }
              return(
                <li className="w3-cell-row padding-0 " >
                  <div className="w3-cell w3-padding w3-left">
                    <label>{dispatch(getText('booking_event_ticket'))}</label>
                  </div>
                  <div className="w3-cell w3-left">
                    {current_packages.map((row, index) =>
                      <div className="w3-cell w3-padding w3-left w3-text-grey" key={index}>
                        {cmd_del(index)}&nbsp;{row.notes}
                      </div>
                    )}
                  </div>
                </li>)
            }
            else {
              return(
                <li className="w3-cell-row padding-0 " >
                  <div className="w3-cell w3-padding w3-left">
                    <label>{dispatch(getText('booking_event_ticket'))}</label>
                    <select className="w3-select w3-border w3-round" value="" style={{backgroundColor:"white"}}
                      onChange={(event) => {
                        dispatch(addFieldItem("event_ticket", event.target.value, event.target.selectedOptions[0].text)) }} >
                        {valid_packages.map((row, index) =>
                          <option key={index} value={row.pkey} >{(row)?row.partnumber+'-'+row.pkey+' ('+row.description+')':''}</option>
                        )}
                    </select>
                  </div>
                  <div className="w3-cell w3-left w3-text-grey">
                    {current_packages.map((row, index) =>
                      <div className="w3-cell w3-padding w3-left" key={index}>
                        <span className="w3-hover-text-red" 
                          onClick={ () => dispatch(removeFieldItem("event_ticket", index)) } style={{cursor: 'pointer'}}><i 
                            className="fa fa-times-circle fa-fw" aria-hidden="true"></i></span>&nbsp;{row.notes}
                      </div>
                    )}
                  </div>
                </li>)}
          })()}
        </ul>
      </div>
    )
  }
}

export default connect((state)=>{return {data: state}})(Event);