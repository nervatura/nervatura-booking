import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paginator } from '../form/Paginator';

class OrderView extends Component {
  constructor(props) {
    super(props);
    
    const { page } = props.data.store.booking.search
    this.state = {
      pagination: {
        page: page.order,
        perPage: 5
      }
    };
  }
  render() {
    const { pagination } = this.state;
    const { dispatch } = this.props
    const { customer, address } = this.props.data.store.booking.login.data
    const { product } = this.props.data.store.server
    const { orderItems, getText, paginate } = this.props.data.actions.app
    const { groupSeparator } = this.props.data.actions.tool;
    let packages = product.slice(0).reverse();
    packages.unshift("");
    const items = dispatch(orderItems())
    let total = items.reduce(function(prevVal, elem, index, array) {
      prevVal.netamount += elem.netamount;
      prevVal.vatamount += elem.vatamount;
      prevVal.amount += elem.amount;
      return prevVal;
    }, {netamount:0, vatamount:0, amount:0 });
    const tableRows = paginate(pagination)(items);
    return(
      <div id="order">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="w3-center text_shadow" style={{marginBottom:0}}>{String(dispatch(getText('booking_order_title'))).toUpperCase()}</h3>
          </div>
        </div>
        <div className="w3-row w3-border-bottom w3-padding-small w3-white" style={{paddingTop:5}}>
          <div className="w3-half w3-padding-small">
            <div className="font-bold" >{customer.custname}</div>
            <div>{address[0].zipcode}&nbsp;{address[0].city}&nbsp;{address[0].street}</div>
            <div>{customer.taxnumber}</div>
          </div>
          <div className="w3-half w3-right-align w3-padding-small w3-mobile">
            <div className="w3-cell-row" >
              <div className="w3-cell w3-right-align" >{dispatch(getText('booking_order_total_netamount'))}:</div>
              <div className="w3-cell w3-right-align" style={{width:100}} >{groupSeparator(Number(total.amount-total.vatamount).toFixed(2))}</div>
            </div>
            <div className="w3-cell-row" >
              <div className="w3-cell w3-right-align" >{dispatch(getText('booking_order_total_vatamount'))}:</div>
              <div className="w3-cell w3-right-align" style={{width:100}} >{groupSeparator(Number(total.vatamount).toFixed(2))}</div>
            </div>
            <div className="w3-cell-row font-bold" >
              <div className="w3-cell w3-right-align" >{dispatch(getText('booking_order_total_amount'))}:</div>
              <div className="w3-cell w3-right-align" style={{width:100}} >{groupSeparator(Number(total.amount).toFixed(2))}</div>
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
        <ul className="w3-ul w3-border-top w3-white">
          {tableRows.rows.map((row, index) =>
            <li className="w3-padding-small" key={index}>
              <div className="w3-cell w3-padding-small" style={{width:100}}>
                <div>{dispatch(getText('booking_order_partnumber'))}</div>
                <div>{row.partnumber}</div>
              </div>
              <div className="w3-cell w3-padding-small w3-right-align" style={{width:50}}>
                <div>{dispatch(getText('booking_order_qty'))}</div>
                <div>{row.qty}</div>
              </div>
              <div className="w3-cell w3-padding-small w3-right-align" style={{width:50}}>
                <div>{dispatch(getText('booking_order_discount'))}</div>
                <div>{row.discount}%</div>
              </div>

              <div className="w3-cell w3-mobile">
                <div className="w3-cell w3-padding-small" style={{width:50}}>
                  <div>{dispatch(getText('booking_order_curr'))}</div>
                  <div>{row.curr}</div>
                </div>
                <div className="w3-cell w3-padding-small w3-right-align">
                  <div>{dispatch(getText('booking_order_netamount'))}</div>
                  <div>{groupSeparator(Number(row.amount-row.vatamount).toFixed(2))}</div>
                </div>
                <div className="w3-cell w3-padding-small w3-right-align" style={{width:50}}>
                  <div>{dispatch(getText('booking_order_taxcode'))}</div>
                  <div>{row.taxcode}</div>
                </div>
                <div className="w3-cell w3-padding-small w3-right-align">
                  <div>{dispatch(getText('booking_order_amount'))}</div>
                  <div>{groupSeparator(Number(row.amount).toFixed(2))}</div>
                </div>
              </div>
              
              <div className="w3-cell w3-mobile w3-padding-small">
                <div>{dispatch(getText('booking_order_description'))}</div>
                <div>{row.description}</div>
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

export default connect((state)=>{return {data: state}})(OrderView);