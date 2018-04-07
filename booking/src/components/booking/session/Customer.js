import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'

class Customer extends Component {
  render() {
    const { dispatch } = this.props
    const { getText, pageEdit } = this.props.data.actions.app
    const { saveData } = this.props.data.actions.api
    const { customer, contact, address, fieldvalue } = this.props.data.store.booking.login.current
    const { defvalues } = this.props.data.store.booking.login.data
    const view = (customer.id) ? "customer" : "registration"
    let customer_group = fieldvalue.filter(function (row) {
      return ((row.fieldname === "customer_group") && (row.deleted === 0)); })
    customer_group = (customer_group.length > 0) ? customer_group[0].notes : "";
    return(
      <div id="customer">
        <div className="w3-cell-row w3-bottombar" >
          <div className="w3-cell" >
            <h3 className="w3-center text_shadow" 
              style={{marginBottom:0}}>{String(dispatch(getText('booking_'+view+'_title'))).toUpperCase()}</h3>
          </div>
        </div>
        <ul className="w3-ul w3-white">
          <li className="w3-padding-small w3-cell-row">
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_custnumber'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={customer.custnumber||''} disabled="disabled"
                onChange={(event) => dispatch(pageEdit("custname", event.target.value))}/>
            </div>
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_custname'))}<span className="w3-text-red" >*</span></label>
              <input type="text" className="w3-input w3-border w3-round" 
                value={customer.custname||''} disabled={(customer.custtype === defvalues.custtype_private) ? "disabled" : ""} 
                onChange={(event) => dispatch(pageEdit("custname", event.target.value))}/>
            </div>
          </li>
          <li className="w3-padding-small w3-cell-row">
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_custtype'))}</label>
              <select className="w3-select w3-border w3-round" 
                value={customer.custtype} style={{backgroundColor:"white"}}
                onChange={(event) => dispatch(pageEdit("custtype", parseInt(event.target.value,10))) } >
                  <option value={defvalues.custtype_company} >{dispatch(getText('booking_customer_custtype_company'))}</option>
                  <option value={defvalues.custtype_private} >{dispatch(getText('booking_customer_custtype_private'))}</option>
                  <option value={defvalues.custtype_other} >{dispatch(getText('booking_customer_custtype_other'))}</option>
              </select>
            </div>
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_contact'))}<span className="w3-text-red" >*</span></label>
              <div className="w3-cell-row" >
                <div className="w3-cell">
                  <input type="text" className="w3-input w3-border w3-round" value={contact[0].firstname||''} 
                    onChange={(event) => dispatch(pageEdit("firstname", event.target.value))}/>
                </div>
                <div className="w3-cell">
                  <input type="text" className="w3-input w3-border w3-round" value={contact[0].surname||''} 
                    onChange={(event) => dispatch(pageEdit("surname", event.target.value))}/>
                </div>
              </div>
            </div>
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_taxnumber'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={customer.taxnumber||''} 
                onChange={(event) => dispatch(pageEdit("taxnumber", event.target.value))}/>
            </div>
          </li>
          <li className="w3-padding-small w3-cell-row">
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_email'))}<span className="w3-text-red" >*</span></label>
              <input type="text" className="w3-input w3-border w3-round" value={contact[0].email||''} 
                onChange={(event) => dispatch(pageEdit("email", event.target.value))}/>
            </div>
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_phone'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={contact[0].phone||''} 
                onChange={(event) => dispatch(pageEdit("phone", event.target.value))}/>
            </div>
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_group'))}</label>
              <input type="text" className="w3-input w3-border w3-round" 
                value={customer_group||''} disabled={true} />
            </div>
          </li>
          <li className="w3-padding-small w3-cell-row">
            <div className="w3-cell w3-mobile w3-padding-small" >
              <label>{dispatch(getText('booking_customer_notes'))}</label>
              <input type="text" className="w3-input w3-border w3-round" value={customer.notes||''} 
                onChange={(event) => dispatch(pageEdit("customer_notes", event.target.value))}/>
            </div>
          </li>
          <li className="w3-padding-small w3-row">
            <div className="w3-half w3-padding-small" >
              <div className="w3-row" >
                <div className="w3-col" style={{width:100}} >
                  <label>{dispatch(getText('booking_customer_zipcode'))}<span className="w3-text-red" >*</span></label>
                  <input type="text" className="w3-input w3-border w3-round" value={address[0].zipcode||''} 
                    onChange={(event) => dispatch(pageEdit("zipcode", event.target.value))}/>
                </div>
                <div className="w3-rest" >
                  <label>{dispatch(getText('booking_customer_city'))}<span className="w3-text-red" >*</span></label>
                  <input type="text" className="w3-input w3-border w3-round" value={address[0].city||''} 
                    onChange={(event) => dispatch(pageEdit("city", event.target.value))}/>
                </div>
              </div>
            </div>
            <div className="w3-half w3-padding-small" >
              <label>{dispatch(getText('booking_customer_street'))}<span className="w3-text-red" >*</span></label>
              <input type="text" className="w3-input w3-border w3-round" value={address[0].street||''} 
                onChange={(event) => dispatch(pageEdit("street", event.target.value))}/>
            </div>
          </li>
          <li className="w3-cell-row w3-padding-small menu_bgcolor w3-border-0" >
            <div className="w3-cell w3-padding-small w3-cell w3-right w3-small"><span className="w3-text-red" >*</span>{dispatch(getText('booking_required_fields'))}</div>
          </li>
          {(() => {
            if(view === "registration"){
              return(
                <li className="w3-padding-small w3-white w3-padding">
                  <div className="w3-cell-row" >
                    <div className="w3-cell w3-center" style={{lineHeight:2}} >
                      <Link className="w3-hover-text-blue title_color" replace to="/" style={{textDecorationColor:"red"}} >{dispatch(getText('booking_agreement_link_1'))}</Link>&nbsp;
                      <span>{dispatch(getText('booking_agreement_link_2'))}</span>
                    </div>
                  </div>
                  <div className="w3-cell-row " >
                    <div className="w3-cell w3-center" >
                      <a className="w3-button w3-white w3-border" 
                        onClick={ (event) => dispatch(saveData("customer"))  }>
                        <i className="fa fa-check-square-o fa-fw" aria-hidden="true"></i> 
                        <span className="font-bold">{dispatch(getText('booking_agreement_label'))}</span></a>
                    </div>
                  </div>
                </li>
              )
            }
            else {
              return null; }
          })()}
        </ul>
      </div>
    )
  }
}

export default connect((state)=>{return {data: state}})(Customer);