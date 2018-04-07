import React, { Component } from 'react';
import { connect } from 'react-redux';

import DateSearch from './session/DateSearch';
import EmailVerified from './session/EmailVerified';
import UserLogin from './session/UserLogin';
import Customer from './session/Customer';
import EventList from './session/EventList';
import Event from './session/Event';
import InvoiceList from './session/InvoiceList';
import PackageList from './session/PackageList';
import OrderItems from './session/OrderItems';
import OrderView from './session/OrderView';

class BookingPage extends Component {
  render() {
    const { dispatch } = this.props
    const { getValidView } = this.props.data.actions.app
    const getPageView = () => {
      switch (dispatch(getValidView())) {
        case "search":
          return <DateSearch />;
        case "verification":
          return <EmailVerified />;
        case "customer":
          return <Customer />;
        case "history":
          return <EventList />;
        case "packages":
          return <PackageList />;
        case "oitems":
          return <OrderItems />;
        case "order":
          return <OrderView />;
        case "invoices":
          return <InvoiceList />;
        case "event":
          return <Event />;
        case "login":
          return <UserLogin />;
        default:
          return null; }}
    return (
      <div id="booking" >
        <div className="w3-cell-row">
          <div className="w3-cell w3-cell-middle w3-center" >
            <div className="w3-card-2 w3-section w3-light-grey">
              <div className="w3-content w3-container w3-padding-24 w3-left-align" >
                {getPageView()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state)=>{return {data: state}})(BookingPage);