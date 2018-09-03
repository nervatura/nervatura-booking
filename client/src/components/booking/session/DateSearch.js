import React, { Component } from 'react';
import { connect } from 'react-redux';

import DateField from '../form/DateField';
import { Paginator } from '../form/Paginator';
import DailyList from './DailyList';

class DateSearch extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.search,
        perPage: 1
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { date_from, date_to, result } = this.props.data.store.booking.search
    const { getText, pageEdit, validValue, paginate } = this.props.data.actions.app
    const { getDays } = this.props.data.actions.api
    const validDateFrom = (value) => {
      return dispatch(validValue("date_from", value));}
    const validDateTo = (value) => {
      return dispatch(validValue("date_to", value));}
    const getSessTable = (index) => {
      if(!result[index]){
        if(result.length > 0){
          index = 0;}
        else
          return null; }
      return(
        <div>
          <div className="w3-padding-small w3-center font-bold w3-grey w3-text-white">
            <label>{result[index].date} - {dispatch(getText('booking_weekday_'+result[index].weekday))}</label>
          </div>
          <div className="w3-row">
            <div className="w3-half">
              <DailyList edate={result[index].date} events={result[index].events} search="AM" />
            </div>
            <div className="w3-half">
              <DailyList edate={result[index].date} events={result[index].events} search="PM" />
            </div>
          </div>
        </div>)}
    return(
      <div id="search">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="w3-center text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_search_title'))).toUpperCase()}</h3>
          </div>
        </div>
        
        <div className="w3-cell-row w3-bottombar">
          <div className="w3-content w3-container padding-large w3-justify" >
            <h3 className="w3-large"><i className="fa fa-exclamation-circle fa-2x fa-fw w3-hide-medium w3-hide-large" aria-hidden="true"></i>
              {dispatch(getText('booking_sessions_please_note'))}</h3>
            <div className="w3-row">
              <div className="w3-col w3-hide-small" style={{width:45}}>
                <i className="fa fa-exclamation-circle fa-5x" aria-hidden="true"></i></div>
              <div className="w3-rest">
                <ul style={{marginTop:0}}>
                  <li>{dispatch(getText('booking_sessions_please_note_1'))}</li>
                  <li>{dispatch(getText('booking_sessions_please_note_2'))}</li>
                  <li>{dispatch(getText('booking_sessions_please_note_3'))}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={{paddingTop:5}} >
          <div className="w3-cell w3-mobile" >
            <div className="w3-cell w3-hide-medium w3-hide-large" style={{minWidth:65}}>
              <label className="">{dispatch(getText('booking_date_from'))}</label>
            </div>
            <div className="w3-cell w3-padding-small" style={{}}>
              <label className="w3-hide-small">{dispatch(getText('booking_date_from'))}</label>
              <DateField fieldname="date_from" value={date_from} onEdit={pageEdit} isValid={validDateFrom} />
            </div>
          </div>
          <div className="w3-cell w3-mobile" >
            <div className="w3-cell w3-hide-medium w3-hide-large" style={{minWidth:65}} >
              <label className="">{dispatch(getText('booking_date_to'))}</label>
            </div>
            <div className="w3-cell w3-padding-small">
              <label className="w3-hide-small">{dispatch(getText('booking_date_to'))}</label>
              <DateField fieldname="date_to" value={date_to} onEdit={pageEdit} isValid={validDateTo} />
            </div>
          </div>
          <div className="w3-cell w3-padding-small w3-cell-bottom w3-mobile">
            <a className="w3-button w3-white w3-border" style={{padding:9}}
              onClick={() => { dispatch(getDays()) }}>
                <i className="fa fa-search fa-fw" aria-hidden="true"></i>&nbsp;
                <b>{dispatch(getText('booking_search_cmd'))}</b></a>
          </div>
        </div>
        {(() => {
          if(result.length > 0){
            const tableRows = paginate(pagination)(result);
            if ((tableRows.amount > 1)) {
              return(
                <div className="w3-responsive" >
                  <Paginator
                    pagination={pagination}
                    pages={tableRows.amount}
                    onSelect={this.onPageSelect.bind(this)} />
                  {getSessTable(pagination.page-1)}
                </div>)}
            else
              return(<div style={{marginTop:10}} >{getSessTable(0)}</div>) }
        })()}
      </div>
    )
  }
  onPageSelect(page) {
    const { dispatch } = this.props
    const { pageEdit } = this.props.data.actions.app
    const { result } = this.props.data.store.booking.search
    const pages = Math.ceil(
      result.length / this.state.pagination.perPage
    );
    dispatch(pageEdit("page", Math.min(Math.max(page, 1), pages)))
    this.setState({
      pagination: Object.assign({}, this.state.pagination, {
        page: Math.min(Math.max(page, 1), pages)
      })
    });
  }
}

export default connect((state)=>{return {data: state}})(DateSearch);