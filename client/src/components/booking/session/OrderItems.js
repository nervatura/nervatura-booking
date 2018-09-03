import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paginator } from '../form/Paginator';

class OrderItems extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.oitems,
        perPage: 5
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { oitems } = this.props.data.store.booking.login
    const { code } = this.props.data.store.booking.search
    const { product } = this.props.data.store.server
    const { getText, paginate, pageEdit, addOrderItem, removeOrderItem, setPageView, setCode, orderItems, removeOrderDiscount } = this.props.data.actions.app
    let packages = product.slice(0).reverse();
    packages.unshift("");
    const items = dispatch(orderItems())
    const tableRows = paginate(pagination)(items);
    const getItemColor = (item) => {
      if(item.oitype === "D") {
        return "w3-text-green" }
      else if(item.oitype === "DQ") {
        return "w3-text-teal" }
      else if(item.oitype === "DA") {
        return "w3-text-orange" }
      else {
        return "" }}
    return(
      <div id="oitems">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_oitems_title'))).toUpperCase()}</h3>
          </div>
          {(() => {
            if(tableRows.rows.length > 0){
              return(
                <div className="w3-cell w3-right" >
                  <a className="w3-button w3-white w3-border"
                    onClick={ (event) => dispatch(setPageView({ view:"order" }))  }>
                    <i className="fa fa-calculator fa-fw" aria-hidden="true"></i> 
                    <span className="font-bold" style={{whiteSpace:"normal"}} >{dispatch(getText('booking_order_title'))}</span></a>
                </div> )
            }
          })()}  
        </div>
        <div className="w3-cell-row w3-center w3-white w3-padding w3-hide-large">
          {(() => {
            if ((oitems.discount.discount > 0)) {
              return (
                  <div className="w3-cell w3-cell-middle font-bold" style={{width:70}}>
                    <div className="w3-badge w3-orange w3-padding" >
                      <span className="w3-large" >-{oitems.discount.discount}%</span>&nbsp;<span className="w3-hover-text-red w3-small" 
                        onClick={ () => dispatch(removeOrderDiscount()) } style={{cursor: 'pointer'}}><i 
                          className="fa fa-times-circle fa-fw" aria-hidden="true"></i></span>
                    </div>
                  </div>
              )}
          })()}
        </div>
        <div className="w3-cell-row w3-border-bottom w3-padding-small w3-white" >
          {(() => {
            if ((oitems.discount.discount > 0)) {
              return (
                <div className="w3-cell w3-hide-small w3-hide-medium w3-cell-middle font-bold" style={{width:70}}>
                  <div className="w3-badge w3-orange w3-padding" >
                    <span className="w3-large" >-{oitems.discount.discount}%</span>&nbsp;<span className="w3-hover-text-red w3-small" 
                      onClick={ () => dispatch(removeOrderDiscount()) } style={{cursor: 'pointer'}}><i 
                        className="fa fa-times-circle fa-fw" aria-hidden="true"></i></span>
                  </div>
                </div>
              )}
          })()}
          <div className="w3-cell w3-padding-small w3-mobile">
            <label>{dispatch(getText('booking_oitems_packages'))}</label>
            <select className="w3-select w3-border w3-round" value="" style={{backgroundColor:"white"}}
              onChange={(event) => dispatch(addOrderItem({ partnumber: event.target.value })) } >
                {packages.map((row, index) =>
                  <option key={index} value={row.partnumber} >{row.description}</option>
                )}
            </select>
          </div>
          <div className="w3-cell w3-cell-middle w3-padding-small w3-mobile" style={{minWidth:220}} >
            <label>{dispatch(getText('booking_oitems_code'))}</label>
            <div className="w3-cell-row">
              <div className="w3-cell">
                <input type="text" className="w3-input w3-border w3-round" value={code||''}
                  disabled={true} 
                  onChange={(event) => dispatch(pageEdit("code", event.target.value))}/>
              </div>
              <div className="w3-cell w3-cell-middle" style={{width:25, padding:2}} >
                <a className="w3-button w3-white w3-border"
                  onClick={ (event) => dispatch(setCode())  } style={{padding:3}} >
                  <i className="fa fa-plus fa-fw" aria-hidden="true"></i></a>
              </div>
            </div>
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
        <div className="w3-cell-row w3-white w3-border-bottom w3-topbar w3-padding-small" >
          <div className="w3-cell w3-padding-small" style={{width:110}}>
            <span>{dispatch(getText('booking_order_partnumber'))}</span>
          </div>
          <div className="w3-cell w3-padding-small w3-right-align" style={{width:70}}>
            <span>{dispatch(getText('booking_order_discount'))}</span>
          </div>
          <div className="w3-cell w3-right-align w3-padding-small" style={{width:100}}>
            <span>{dispatch(getText('booking_order_amount'))}</span>
          </div>
          <div className="w3-cell w3-padding-small">
            <span className="w3-hide-small" >{dispatch(getText('booking_order_description'))}</span>
          </div>
        </div>
        <ul className="w3-ul w3-striped-ul w3-border-top w3-white w3-hoverable" style={{padding:3}} >
          {tableRows.rows.map((row, index) =>
            <li className={"w3-padding-small " + getItemColor(row) } key={index}>
              <div className="w3-cell w3-padding-small" style={{width:110}}>
                <span className="w3-hover-text-red" 
                  onClick={ () => dispatch(removeOrderItem(index)) } style={{cursor: 'pointer'}}><i 
                    className="fa fa-times-circle fa-fw" aria-hidden="true"></i></span>&nbsp;
                <label className="font-bold">{row.partnumber}</label>
              </div>
              <div className="w3-cell w3-padding-small w3-right-align" style={{width:70}}>
                <span>{row.discount}%</span>
              </div>
              <div className="w3-cell w3-padding-small w3-right-align" style={{width:100}}>
                <span>{row.amount} {row.curr}</span>
              </div>
              <div className="w3-cell w3-mobile w3-padding-small">
                <span>{row.description}</span>
              </div>
            </li>
          )}
        </ul>
      </div>
    )
  }
  onPageSelect(page) {
    const { dispatch } = this.props
    const { pageEdit, orderItems } = this.props.data.actions.app
    const items = dispatch(orderItems())
    const pages = Math.ceil(
      items.length / this.state.pagination.perPage
    );
    dispatch(pageEdit("page", Math.min(Math.max(page, 1), pages)))
    this.setState({
      pagination: Object.assign({}, this.state.pagination, {
        page: Math.min(Math.max(page, 1), pages)
      })
    });
  }
}

export default connect((state)=>{return {data: state}})(OrderItems);