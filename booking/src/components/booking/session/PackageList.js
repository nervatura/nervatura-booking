import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paginator } from '../form/Paginator';

class PackageList extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.packages,
        perPage: 5
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { packages } = this.props.data.store.booking.login.data
    const { getText, paginate, setPageView } = this.props.data.actions.app
    const tableRows = paginate(pagination)(packages);
    return(
      <div id="packages">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_packages_title'))).toUpperCase()}</h3>
          </div>
          <div className="w3-cell w3-right" >
            <a className="w3-button w3-white w3-border" 
              onClick={ (event) => dispatch(setPageView({ view:"oitems" }))  }>
              <i className="fa fa-cart-plus fa-fw" aria-hidden="true"></i> 
              <span className="font-bold">{dispatch(getText('booking_oitems_title'))}</span></a>
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
            <li className="w3-cell-row w3-padding-small" key={index}> 
              <div className="w3-text-blue-grey w3-cell w3-cell-middle" 
                style={{width:30, paddingTop:6}}>
                <div className="w3-cell w3-cell-middle" >
                  {(() => {
                    if(row.valid) {
                      return(
                        <span className="w3-text-teal"><i className="fa fa-check-circle-o fa-fw fa-2x" aria-hidden="true"></i></span>) }
                    else {
                      return(
                        <span className="w3-text-grey"><i className="fa fa-times fa-fw fa-2x" aria-hidden="true"></i></span>) }
                  })()}
                </div>
              </div>
              <div className="w3-cell" style={{paddingTop:8, paddingBottom:8}} >
                <div className="w3-cell w3-container w3-mobile"><span className="font-bold" >{row.partnumber}-{row.pkey}</span></div>
                <div className="w3-cell w3-container">
                  <i className="fa fa-shopping-cart fa-fw" aria-hidden="true"></i>
                  <span>{row.transdate}</span>
                </div>
                <div className="w3-cell w3-container" style={{minWidth:130}} >
                  {(() => {
                    if(row.expiration) {
                      return(
                        <span><i className="fa fa-calendar-times-o fa-fw" aria-hidden="true">
                        </i>{row.expiration}</span>) }
                    else {
                      return(
                        <span><i className="fa fa-history fa-fw" aria-hidden="true">
                        </i>{row.qty}/{row.available}</span>) }
                  })()}
                </div>
                <div className="w3-cell w3-container w3-mobile"><span>{row.description}</span></div>          
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
    const { packages } = this.props.data.store.booking.login.data
    const pages = Math.ceil(
      packages.length / this.state.pagination.perPage
    );
    dispatch(pageEdit("page", Math.min(Math.max(page, 1), pages)))
    this.setState({
      pagination: Object.assign({}, this.state.pagination, {
        page: Math.min(Math.max(page, 1), pages)
      })
    });
  }
}

export default connect((state)=>{return {data: state}})(PackageList);