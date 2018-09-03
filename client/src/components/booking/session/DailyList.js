import React, { Component } from 'react';
import { connect } from 'react-redux';

class DailyList extends Component {
  render() {
    const { edate, events, search } = this.props
    const { dispatch } = this.props
    const { setPageView, getText } = this.props.data.actions.app
    const readonly = (row) => {
      return (row.capacity > row.qty) ? false : true;
    }
    const get_icon = (row) => {
      if(readonly(row))
        return "minus-circle"
      else
        return "edit" }
    const get_disabled = (row) => {
      if(readonly(row))
        return "w3-opacity w3-light-grey"
      else
        return "edit" }
    const get_color = (row) => {
      if(readonly(row))
        return "w3-text-light-grey"
      else
        return "w3-text-light-green" }
    const get_hover_color = (row) => {
      if(readonly(row))
        return "w3-hover-text-red"
      else
        return "w3-hover-text-green" }
    const get_free = (row) => {
      if(row.free){
        return <span>{dispatch(getText('booking_free'))}</span>}
      else {
        return null; }}
    return(
      <ul className="w3-ul w3-border w3-white w3-hoverable">
        {events.filter(function(row){
          return (row.am_pm === search);
          }).map((row, index) =>
          <li className={"w3-padding-small "+get_disabled(row)} key={index}
            style={!readonly(row) ? { cursor: 'pointer' } : {}}>
            <div className="w3-row">
              <div className={"w3-text-blue-grey w3-col "+get_hover_color(row)} 
                onClick={ (!readonly(row)) ? () => dispatch(setPageView({ view: "event", date:edate, session: row })) : null }
                style={{width:30, padding:6}}>
                <i className={"fa fa-"+get_icon(row)+" fa-fw"} aria-hidden="true"></i>
              </div>
              <div className="w3-col w3-right" style={{width:50, padding:9}}>
                <span className={"w3-badge font-bold w3-right "+get_color(row)}>{row.capacity-row.qty}</span>
              </div>
              <div className="w3-rest" 
                onClick={ (!readonly(row)) ? () => dispatch(setPageView({ view: "event", date:edate, session: row })) : null } >
                <div className="w3-cell-row w3-border-bottom" >
                  <span className="font-bold" >{row.start_time}</span>&nbsp;&nbsp;&nbsp;{get_free(row)}
                </div>
                <div className="w3-cell-row" >
                  <span>{row.end_time}</span>
                </div>                
              </div>
            </div>
          </li>
        )}
      </ul>
    )
  }
}

export default connect((state)=>{return {data: state}})(DailyList);