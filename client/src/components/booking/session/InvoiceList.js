import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paginator } from '../form/Paginator';

class InvoiceList extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.invoices,
        perPage: 5
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { invoice } = this.props.data.store.booking.login.data
    const { getText, paginate, setPageView } = this.props.data.actions.app
    const { getInvoice } = this.props.data.actions.api
    const tableRows = paginate(pagination)(invoice);
    return(
      <div id="invoices">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_invoices_title'))).toUpperCase()}</h3>
          </div>
          <div className="w3-cell w3-right" >
            <a className="w3-button w3-white w3-border" 
              onClick={ (event) => dispatch(setPageView({ view:"packages" }))  }>
              <i className="fa fa-ticket fa-fw" aria-hidden="true"></i> 
              <span className="font-bold">{dispatch(getText('booking_packages_title'))}</span></a>
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
            <li className="w3-padding-small" key={index}>
              <div className="w3-cell-row">
                <div className="w3-cell" style={{paddingTop:8, paddingBottom:8}} >
                  <div className="w3-cell w3-container w3-mobile"><span className="font-bold" >{row.transnumber}</span></div>
                  <div className="w3-cell w3-container">
                    <i className="fa fa-calendar fa-fw" aria-hidden="true"></i>
                    <span>{String(row.transdate).substr(0,10)}</span>
                  </div>
                  <div className="w3-cell w3-container">
                    <span>{row.curr}&nbsp;{row.amount}</span>
                  </div>          
                </div>
                <div className="w3-text-blue-grey w3-hover-text-blue w3-cell w3-cell-middle"
                  onClick={ (event) => dispatch(getInvoice(row.transnumber)) } 
                  style={{width:40, paddingTop:6, cursor: 'pointer'}}>
                  <div className="w3-cell w3-cell-middle" ><i className={"fa fa-download fa-fw fa-2x"} aria-hidden="true"></i></div>
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
    const { invoice } = this.props.data.store.booking.login.data
    const pages = Math.ceil(
      invoice.length / this.state.pagination.perPage
    );
    dispatch(pageEdit("page", Math.min(Math.max(page, 1), pages)))
    this.setState({
      pagination: Object.assign({}, this.state.pagination, {
        page: Math.min(Math.max(page, 1), pages)
      })
    });
  }
}

export default connect((state)=>{return {data: state}})(InvoiceList);