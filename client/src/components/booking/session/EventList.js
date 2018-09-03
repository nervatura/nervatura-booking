import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paginator } from '../form/Paginator';
import moment from 'moment';

class EventList extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.history,
        perPage: 5
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { event } = this.props.data.store.booking.login.data
    const { getText, paginate, setPageView, deleteEvent } = this.props.data.actions.app
    const tableRows = paginate(pagination)(event);
    const readonly = (row) => {
      return moment(row.fromdate,'YYYY-MM-DD HH:mm').isBefore(moment().add(1, 'day')); }
    const get_icon = (row) => {
      if(readonly(row))
        return "lock"
      else
        return "calendar-check-o" }
    const get_disabled = (row) => {
      if(readonly(row))
        return "w3-opacity w3-light-grey"
      else
        return "edit" }
    const get_hover_color = (row) => {
      if(readonly(row))
        return "w3-hover-text-red"
      else
        return "w3-hover-text-green" }
    return(
      <div id="history">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_history_title'))).toUpperCase()}</h3>
          </div>
          <div className="w3-cell w3-right" >
            <a className="w3-button w3-white w3-border" 
              onClick={ (event) => dispatch(setPageView({ view:"search" }))  }>
              <i className="fa fa-search fa-fw" aria-hidden="true"></i> 
              <span className="font-bold">{dispatch(getText('booking_search_title'))}</span></a>
          </div>
        </div>
        {(() => {
          if ((tableRows.amount > 1)) {
            return <Paginator
              pagination={pagination}
              pages={tableRows.amount}
              onSelect={this.onPageSelect.bind(this)} />
          }
        })()}
        <ul className="w3-ul w3-striped-ul w3-border w3-white w3-hoverable" style={{padding:3}} >
          {tableRows.rows.map((row, index) =>
            <li className={"w3-padding-small "+get_disabled(row)} key={index}
              style={!readonly(row) ? { cursor: 'pointer' } : {}}>
              <div className="w3-row">
                <div className={"w3-text-blue-grey w3-col "+get_hover_color(row)} 
                  onClick={ (!readonly(row)) ? () => dispatch(setPageView({ view: "event", event: row })) : null }
                  style={{width:30, paddingTop:6}}>
                  <i className={"fa fa-"+get_icon(row)+" fa-fw fa-2x"} aria-hidden="true"></i>
                </div>
                {(() => {
                  if(!readonly(row)) {
                    return(
                      <div className="w3-col w3-right" style={{width:40, paddingTop:6}}>
                        <span onClick={ () => dispatch(deleteEvent(row)) } disabled="disabled"
                            className="w3-text-blue-grey w3-hover-text-red"
                            ><i className="fa fa-trash fa-fw fa-2x" aria-hidden="true"></i>
                        </span>
                      </div>)}
                    else {
                      return null; }
                })()}
                <div className="w3-rest w3-padding" 
                  onClick={ (!readonly(row)) ? () => dispatch(setPageView({ view: "event", event: row })) : null } >
                  <span className="font-bold" >{String(row.fromdate).substr(0,10)}</span>&nbsp;&nbsp;&nbsp;&nbsp;
                  <i className="fa fa-clock-o fa-fw" aria-hidden="true"></i><span>{String(row.fromdate).substr(11,5)} - {String(row.todate).substr(11,5)}</span>              
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    )
  }
  onPageSelect(page) {
    const { dispatch } = this.props
    const { pageEdit } = this.props.data.actions.app
    const { event } = this.props.data.store.booking.login.data
    const pages = Math.ceil(
      event.length / this.state.pagination.perPage
    );
    dispatch(pageEdit("page", Math.min(Math.max(page, 1), pages)))
    this.setState({
      pagination: Object.assign({}, this.state.pagination, {
        page: Math.min(Math.max(page, 1), pages)
      })
    });
  }
}

export default connect((state)=>{return {data: state}})(EventList);