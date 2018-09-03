import moment from 'moment';

export const appData = (key_, data_) => {
  return (dispatch, getState) => {
    dispatch({ type: "APP_DATA", key: key_, data: data_ })
  }
}

export const appState = (key, value) => {
  return (dispatch, getState) => {
    let state = getState().store.state;
    state[key] = value;
    dispatch(appData("state", state))
  }
}

export const setLang = (value) => {
  return (dispatch, getState) => {
    const { state, def } = getState().store;
    if (state.lang !== value) {
      if (Object.keys(def.locales).indexOf(value) > -1) {
        dispatch(appState("lang", value));
        localStorage.setItem("lang", value)
      }
    }
  }
}

export const getText = (key) => {
  return (dispatch, getState) => {
    const { state, def } = getState().store;
    if (def.locales[state.lang][key]) {
      return def.locales[state.lang][key];
    }
    else {
      return def.locales[def.locale][key] || "";
    }
  }
}

export const showMessage = (params) => {
  return (dispatch, getState) => {
    if (typeof params.value === "string") {
      if (String(params.value).indexOf("[") > -1) {
        params.value = params.value.substr(0, params.value.indexOf("["));
      }
    }
    if (typeof params.value.message !== "undefined") { params.value = params.value.message; }
    dispatch(appData("modal", {
      type: 'msg',
      msg_icon: params.icon || "exclamation",
      msg_title: params.title || dispatch(getText("msg_warning")),
      msg_text: params.value || "",
      msg_cancel: params.callback || null
    }))
  }
}

export const getPrice = (params) => {
  return (dispatch, getState) => {
    const { price, product, settings } = getState().store.server;
    let product_item = product.filter(function (row) {
      return (row.partnumber === params.partnumber);
    })[0] || {}
    
    if(!params.oitype){
      params.oitype = (params.discount) ? "D" : "P"; }
    params.qty = params.qty || 1;
    params.discount = params.discount || 0;
    params.curr = params.curr || settings.currency;
    params.description = params.description || product_item.description;
    params.code = params.code || {};

    let product_price = price.filter(function (row) {
      return ((row.partnumber === params.partnumber) && (row.curr === params.curr));
    })[0]
    if (product_price) {
      let _netamount = parseFloat(Number(parseFloat(product_price.pricevalue) * (1 - parseFloat(params.discount) / 100).toFixed(product_price.digit)));
      let _netamount1 = parseFloat(Number(parseFloat(product_price.pricevalue).toFixed(product_price.digit)))
      let _vatamount = parseFloat(_netamount) * parseFloat(product_item.rate);
      let _vatamount1 = parseFloat(_netamount1) * parseFloat(product_item.rate);
      return {
        oitype: params.oitype, code: params.code, partnumber: params.partnumber, description: params.description, 
        unit: product_item.unit, curr: params.curr, discount: params.discount, qty: params.qty,
        fxprice: product_price.pricevalue,
        price: parseFloat(Number((parseFloat(Number(_netamount1).toFixed(product_price.digit)) + parseFloat(Number(_vatamount1).toFixed(product_price.digit)))).toFixed(product_price.digit)),
        taxcode: product_item.taxcode, rate: product_item.rate,
        netamount: parseFloat(Number(params.qty * _netamount).toFixed(product_price.digit)),
        vatamount: parseFloat(Number(params.qty * _vatamount).toFixed(product_price.digit)),
        amount: parseFloat(Number(params.qty * (parseFloat(Number(_netamount).toFixed(product_price.digit)) + parseFloat(Number(_vatamount).toFixed(product_price.digit)))).toFixed(product_price.digit))
      };
    }
    else if (product_item)
      return {
        oitype: params.oitype, code: params.code, partnumber: params.partnumber, description: params.description, 
        unit: product_item.unit, taxcode: product_item.taxcode, rate: product_item.rate, curr: params.curr, 
        discount: params.discount, qty: params.qty, fxprice: 0, price: 0, netamount: 0, vatamount: 0, amount: 0
      }
    else
      return {
        oitype: params.oitype, code: params.code, partnumber: params.partnumber, description: "", unit: "", taxcode: "", 
        rate: 0, curr: params.curr, discount: params.discount, qty: params.qty, fxprice: 0,
        price: 0, netamount: 0, vatamount: 0, amount: 0
      }
  }
}

export const initCustomer = (store, booking) => {
  const { data } = booking.login;
  booking.login.current = {}
  if (!data.customer) {
    booking.login.data.dirty = true;
    booking.login.current.customer =
      {
        id: null,
        custtype: data.defvalues.custtype_private,
        custnumber: data.uid,
        custname: null,
        taxnumber: null, account: null,
        notax: 0, terms: 0, creditlimit: 0, discount: 0,
        notes: null, inactive: 0, deleted: 0
      }
  }
  else {
    booking.login.current.customer = Object.assign({}, data.customer);
  }
  booking.login.current.address = JSON.parse(JSON.stringify(data.address || []));
  if (booking.login.current.address.length === 0) {
    booking.login.current.address =
      [{
        id: null,
        nervatype: data.defvalues.nervatype_customer,
        ref_id: null,
        country: store.server.settings.country, state: null,
        zipcode: null, city: null, street: null, notes: null, deleted: 0
      }]
  }
  booking.login.current.contact = JSON.parse(JSON.stringify(data.contact || []));
  if (booking.login.current.contact.length === 0) {
    booking.login.current.contact =
      [{
        id: null,
        nervatype: data.defvalues.nervatype_customer,
        ref_id: null,
        firstname: null, surname: null, status: null,
        phone: (booking.login.provider === "phone") ? data.uid : null,
        email: (booking.login.provider !== "phone") ? data.uid : null,
        fax: null, mobil: null,
        notes: null, deleted: 0
      }]
  }
  booking.login.current.fieldvalue = JSON.parse(JSON.stringify(data.fieldvalue || []));
  return booking;
}

export const initEvent = (booking, edate, session, event) => {
  const { nervatype_customer, eventgroup_free_session, eventgroup_paid_session } = booking.login.data.defvalues
  booking.login.current = { session: session }
  if (event) {
    booking.login.current.event = event;
  }
  else {
    booking.login.data.dirty = true;
    booking.login.current.event = {
      id: null,
      calnumber: session.sess_id + "-" + String(new Date().getTime()).substr(8),
      nervatype: nervatype_customer,
      ref_id: booking.login.data.customer.id,
      uid: null,
      eventgroup: (session.free) ? eventgroup_free_session : eventgroup_paid_session,
      fromdate: edate + ' ' + session.start_time,
      todate: edate + ' ' + session.end_time,
      subject: null,
      place: null,
      description: null,
      deleted: 0
    };
  }
  if (event) {
    booking.login.current.fieldvalue = booking.login.data.fieldvalue.filter(function (row) {
      return (((row.fieldname === "event_guest") || (row.fieldname === "event_ticket")) &&
        (row.deleted === 0) && (row.ref_id === event.id));
    })
  }
  else {
    booking.login.current.fieldvalue = [
      {
        id: null, fieldname: "event_guest", ref_id: null,
        value: (session.free) ? 1 : 0,
        notes: null, deleted: 0
      }
    ]
  }
  booking.login.current.edate_packages = [];
  if (!event) {
    booking.login.data.event.forEach(event => {
      if(moment(event.fromdate,'YYYY-MM-DD HH:mm').format('YYYY-MM-DD') === edate){
        const event_ticket = booking.login.data.fieldvalue.filter(function (row) {
          return ((row.fieldname === "event_ticket") &&
            (row.deleted === 0) && (row.ref_id === event.id));})[0]
        booking.login.data.packages.forEach(pack => {
          if((pack.expiration) && (pack.pkey === parseInt(event_ticket.value,10))){
            booking.login.current.edate_packages.push(pack.pkey); }}); }});  
  }
  return booking;
}

const setCheckDigit = (code) => {
  const multipliers = [7, 3, 1]
  let checkDigit = -1;
  let multiplierIndex = 0;
  let sum = 0;
  for (let i = String(code).length-1; i >= 0; i--) {
    if (multiplierIndex === 3) {
      multiplierIndex = 0; }
    sum += parseInt(String(code)[i],10)*multipliers[multiplierIndex];
    multiplierIndex++; }
  checkDigit = 10 - sum % 10;
  if (checkDigit === 10) {
    checkDigit = 0; }

  return code+checkDigit;      
}

export const setPageView = (params) => {
  return (dispatch, getState) => {
    const { zeroPad } = getState().actions.tool;
    let booking = params.booking || getState().store.booking;
    const get_transnumber = () => {
      let refno = zeroPad(booking.login.data.customer.id,3)+String(new Date().getTime()).substr(8);
      return setCheckDigit(refno); }
    booking.login.data.dirty = false;

    const get_login_view = () => {
      if (booking.login.data.uid && !booking.login.data.customer) {
        if (booking.login.data.verified === false) {
          booking.view = "verification";
        }
        else {
          booking.view = "customer";
          booking = initCustomer(getState().store, booking);
        }
      }
      else {
        booking.view = "login";
      }
    }

    switch (params.view) {
      case "booking":
        get_login_view();
        if(booking.view === "login"){
          booking.view = "search"; }
        break;
        
      case "login":
        get_login_view();
        break;

      case "customer":
        if (!booking.login.data.uid) {
          get_login_view(); }
        else {
          booking.view = params.view;
         booking = initCustomer(getState().store, booking); }
        break;

      case "event":
        if (!booking.login.data.customer) {
          if (params.session && params.date) {
            localStorage.setItem("login_session", JSON.stringify(params.session));
            localStorage.setItem("login_date", params.date);
          }
          get_login_view();
        }
        else {
          if (!params.event && !params.session) {
            if (localStorage.getItem("login_session")) {
              params.session = JSON.parse(localStorage.getItem("login_session"));
              localStorage.removeItem("login_session");
              params.date = localStorage.getItem("login_date");
              localStorage.removeItem("login_date");
            }
          }
          if (params.event || params.session) {
            booking.view = params.view;
            booking = initEvent(booking, params.date, params.session, params.event);
          }
          else {
            booking.view = "search";
          }
        }
        break;

      case "oitems":
        if (booking.login.data.customer) {
          booking.view = params.view;
          let discount = { discount: booking.login.data.customer.discount };
          if (localStorage.getItem("oitems")) {
            booking.login.oitems = JSON.parse(localStorage.getItem("oitems"));
            if(!booking.login.oitems.discount.usable) {
              booking.login.oitems.discount = discount; }
            const order = booking.login.data.order.filter(function (row) {
              return (row.order_no === booking.login.oitems.transnumber);
            });
            if (order.length > 0) {
              if ((order[0].invoice_no !== null) || (order[0].paid === 1)) {
                booking.login.oitems = {
                  transnumber: get_transnumber(),
                  discount: discount,
                  items: []
                }
              }
              else {
                booking.login.oitems.transnumber = get_transnumber();
              }
              localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
            }
          }
          else {
            booking.login.oitems = {
              transnumber: get_transnumber(),
              discount: discount,
              items: []
            };
            localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
          }
          if ((booking.login.oitems.items.length === 0) && (booking.login.data.invoice.length === 0)) {
            booking.login.oitems.items = [dispatch(getPrice({
              partnumber: "TSP01", discount: 50, description: dispatch(getText("price_list_label_1"))
            }))];
            localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
          }
        }
        else {
          booking.view = "login";
        }
        break;

      default:
        booking.view = params.view;
        break;
    }
    if (params.view && params.view !== "login" && params.view !== "order") {
      localStorage.setItem("booking_view", params.view);
    }
    dispatch(appData("booking", booking));
  }
}

export const getValidView = () => {
  return (dispatch, getState) => {
    const { view, login } = getState().store.booking
    if (!login.data.customer) {
      switch (view) {
        case "search":
        case "verification":
          return view;
        case "customer":
          if (login.data.uid) {
            return "customer";
          }
          else {
            return "login";
          }
        default:
          return "login";
      }
    }
    else if (!login.data.customer.id) {
      return "customer";
    }
    else {
      return view;
    }
  }
}

export const validForm = (key) => {
  return (dispatch, getState) => {
    const { customer, contact, address, fieldvalue } = getState().store.booking.login.current
    switch (key) {
      case "customer":
        if ((customer.custname === null) || (customer.custname === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_custname")) }
        }
        else if ((contact[0].firstname === null) || (contact[0].firstname === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_contact")) }
        }
        else if ((contact[0].surname === null) || (contact[0].surname === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_contact")) }
        }
        else if ((contact[0].email === null) || (contact[0].email === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_email")) }
        }
        else if ((address[0].zipcode === null) || (address[0].zipcode === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_zipcode")) }
        }
        else if ((address[0].city === null) || (address[0].city === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_city")) }
        }
        else if ((address[0].street === null) || (address[0].street === "")) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_customer_street")) }
        }
        else {
          return { valid: true, err: null }
        }

      case "event":
        let event_guest = fieldvalue.filter(function (row) {
          return ((row.fieldname === "event_guest") && (row.deleted === 0));
        })[0];
        if (event_guest.value === 0) {
          return { valid: false, err: dispatch(getText("msg_required")) + " " + dispatch(getText("booking_event_guest")) }
        }
        else {
          return { valid: true, err: null }
        }

      default:
        return { valid: true, err: null };
    }
  }
}

export const validValue = (key, value, data) => {
  return (dispatch, getState) => {
    const { booking_day_limit } = getState().store.server.settings;
    switch (key) {
      case "date_from":
      case "date_to":
        return moment(value).isAfter(moment().subtract(1, 'day')) &&
          moment(value).isBefore(moment().add(booking_day_limit, 'day'));
      case "event_guest":
        if (value > (data.capacity - data.qty)) {
          value = data.capacity - data.qty;
        }
        else if (value < 1) {
          value = 1;
        }
        return value;
      default:
        return true;
    }
  }
}

export const pageEdit = (fieldname, value, idx, booking) => {
  return (dispatch, getState) => {
    booking = booking || getState().store.booking;
    switch (booking.view) {
      case "search":
      case "history":
      case "order":
      case "invoices":
      case "packages":
        switch (fieldname) {
          case "date_from":
            if (!dispatch(validValue(fieldname, value))) {
              value = moment().format('YYYY-MM-DD');
            }
            booking.search[fieldname] = value;
            break;

          case "date_to":
            if (!dispatch(validValue(fieldname, value))) {
              value = moment().add(5, 'day').format('YYYY-MM-DD');
            }
            booking.search[fieldname] = value;
            break;

          case "page":
            booking.search.page[booking.view] = value;
            break;

          default:
            booking.search[fieldname] = value;
            break;
        }
        break;

      case "oitems":
        switch (fieldname) {
          case "code":
            booking.search[fieldname] = value;
            break;

          case "page":
            booking.search.page.oitems = value;
            break;

          case "qty":
            if (booking.login.oitems.items.length > idx) {
              booking.login.oitems.items[idx] = dispatch(getPrice({
                partnumber: booking.login.oitems.items[idx].partnumber, qty: value
              }));
            }
            break;

          default:
            if (booking.login.oitems.items.length > 0) {
              booking.login.oitems.items[idx][fieldname] = value;
            }
            break;
        }
        localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
        break;

      case "customer":
        booking.login.data.dirty = true;
        switch (fieldname) {
          case "custnumber":
          case "custname":
          case "taxnumber":
          case "custtype":
            booking.login.current.customer[fieldname] = value;
            break;

          case "customer_notes":
            booking.login.current.customer.notes = value;
            break;

          case "email":
          case "phone":
            booking.login.current.contact[0][fieldname] = value;
            break;

          case "firstname":
          case "surname":
            booking.login.current.contact[0][fieldname] = value;
            if (booking.login.current.customer.custtype === booking.login.data.defvalues.custtype_private) {
              if (booking.login.current.contact[0].firstname || booking.login.current.contact[0].surname) {
                booking.login.current.customer.custname = (booking.login.current.contact[0].firstname || "") + " " + (booking.login.current.contact[0].surname || "");
              }
              else {
                booking.login.current.customer.custname = null;
              }
            }
            break;

          case "zipcode":
          case "city":
          case "street":
            booking.login.current.address[0][fieldname] = value;
            break;

          default:
            break;
        }
        break;

      case "event":
        booking.login.data.dirty = true;
        switch (fieldname) {
          case "description":
            booking.login.current.event[fieldname] = value;
            break;

          case "event_guest":
            let event_fieldvalue = booking.login.current.fieldvalue.filter(function (row) {
              return ((row.fieldname === fieldname) && (row.deleted === 0));
            })
            if (event_fieldvalue.length > 0) {
              event_fieldvalue[0].value = value;
            }
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }

    dispatch(appData("booking", booking));
  }
}

export const addFieldItem = (fieldname, value, notes) => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    booking.login.data.dirty = true;
    booking.login.current.fieldvalue.push(
      {
        id: null,
        fieldname: fieldname,
        ref_id: null, value: value, notes: notes || null, deleted: 0
      });
    if (fieldname === "event_ticket") {
      const event_ticket = booking.login.current.fieldvalue.filter(function (row) {
        return ((row.fieldname === "event_ticket") && (row.deleted === 0));
      }).length
      dispatch(pageEdit("event_guest", event_ticket, 0, booking));
    }
    else {
      dispatch(appData("booking", booking));
    }
  }
}

export const removeFieldItem = (fieldname, idx) => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    let field_count = booking.login.current.fieldvalue.filter(function (row) {
      return ((row.fieldname === fieldname) && (row.deleted === 0));
    }).length;
    if (field_count === 0) {
      return false;
    }
    let fieldvalue = booking.login.current.fieldvalue.filter(function (row) {
      return ((row.fieldname === fieldname) && (row.deleted === 0));
    }).filter(function (row, index) {
      return ((idx === index));
    })
    if (fieldvalue.length > 0) {
      if(fieldvalue[0].id === null) {
        booking.login.current.fieldvalue.splice(booking.login.current.fieldvalue.indexOf(fieldvalue[0]),1); }
      else {
        fieldvalue[0].deleted = 1; }
      booking.login.data.dirty = true;
      if (fieldname === "event_ticket") {
        const event_ticket = booking.login.current.fieldvalue.filter(function (row) {
          return ((row.fieldname === "event_ticket") && (row.deleted === 0));
        }).length
        dispatch(pageEdit("event_guest", event_ticket, 0, booking));
      }
      else {
        dispatch(appData("booking", booking));
      }
    }
  }
}

export const addOrderItem = (params) => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    booking.login.oitems.items.push(dispatch(getPrice(params)));
    if(params.code) {
      booking.search.code = "";}
    localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
    dispatch(appData("booking", booking));
  }
}

export const removeOrderItem = (idx) => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    if (booking.login.oitems.items.length > idx) {
      booking.login.oitems.items.splice(idx, 1);
      localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
      dispatch(appData("booking", booking));
    }
  }
}

export const removeOrderDiscount = () => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    booking.login.oitems.discount = { discount: booking.login.data.customer.discount };
    localStorage.setItem("oitems", JSON.stringify(booking.login.oitems));
    dispatch(appData("booking", booking));
  }
}

export const cancelData = () => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    switch (booking.view) {
      case "customer":
        dispatch(setPageView({ view: "customer" }))
        break;

      case "event":
        if (booking.login.current.event.id === null) {
          dispatch(setPageView({ view: "search" }));
        }
        else {
          dispatch(setPageView({ view: "history" }));
        }
        break;

      case "order":
        dispatch(setPageView({ view: "oitems" }))
        break;

      default:
        break;
    }
  }
}

export const deleteEvent = (event) => {
  return (dispatch, getState) => {
    let booking = getState().store.booking;
    const { saveData } = getState().actions.api
    dispatch(showMessage({
      value: dispatch(getText("msg_delete_text")), callback: () => {
        booking.login.current = { event: event }
        booking.login.current.event.deleted = 1;
        dispatch(saveData("history"))
      }
    }))
  }
}

export const orderItems = () => {
  return (dispatch, getState) => {
    const { oitems, data } = getState().store.booking.login
    const { discount_qty_limit, discount_qty_value } = getState().store.server.settings
    let items = []; let product_items = {}
    const discount = oitems.discount || { discount: data.customer.discount }
    oitems.items.forEach((_item, index) => {
      let item = Object.assign({}, _item)
      if (!product_items[item.partnumber]) {
        product_items[item.partnumber] = []}
      if(item.oitype === "P") {
        if(discount.discount > 0){
          item.oitype = "DA";
          item.discount = discount.discount;
          item = dispatch(getPrice(item)); }
        product_items[item.partnumber].push(item);}
      items.push(item);});
    for (const partnumber in product_items) {
      if((product_items[partnumber].length >= discount_qty_limit) && (discount_qty_value > discount.discount)){
        for (let index = 0; index < items.length; index++) {
          if((items[index].partnumber === partnumber) && (items[index].oitype !== "D")){
            items[index].oitype = "DQ";
            items[index].discount = discount_qty_value;
            items[index] = dispatch(getPrice(items[index])) }}}}
    return items;
  }
}

export const createOrder = () => {
  return (dispatch, getState) => {
    const { state } = getState().store;
    const { currency } = getState().store.server.settings;
    const { oitems } = getState().store.booking.login
    const { customer, contact, address, defvalues } = getState().store.booking.login.data
    const { sendOrder } = getState().actions.api
    const get_locale = () => {
      switch (state.lang) {
        case "fi":
          return "fi_FI";
        case "se":
          return "sv_SE";
        default:
          return "en_US";
      }
    }

    let order = {
      trans: {
        transnumber: oitems.transnumber,
        transtype: "order",
        direction: "out",
        transdate: moment().format('YYYY-MM-DD'),
        duedate: moment().format('YYYY-MM-DD 00:00'),
        custnumber: customer.custnumber,
        paidtype: "transfer",
        curr: currency
      },
      payment: {
        orderNumber: oitems.transnumber,
        referenceNumber: oitems.transnumber,
        currency: currency,
        locale: get_locale(),
        urlSet: {},
        orderDetails: {
          includeVat: 1,
          contact: {
            telephone: contact[0].phone || "",
            email: contact[0].email,
            firstName: contact[0].firstname || "",
            lastName: contact[0].surname || "",
            companyName: (customer.custtype !== defvalues.custtype_private) ? customer.custname : "",
            address: {
              street: address[0].street,
              postalCode: address[0].zipcode,
              postalOffice: address[0].city,
              country: address[0].country
            }
          },
          products: []
        }
      },
      items: [],
      fieldvalue: [],
      amount: 0
    }
    if(oitems.discount){
      if(oitems.discount.usable === "single") {
        order.fieldvalue.push({
          id: null, fieldname: "customer_code",
          refnumber: customer.custnumber, 
          value: oitems.discount.code, notes: null, deleted: 0 }) }}
    const items = dispatch(orderItems())
    items.forEach((item, index) => {
      order.amount += item.amount;
      order.items.push({
        transnumber: oitems.transnumber,
        rownumber: index + 1,
        partnumber: item.partnumber,
        description: item.description,
        unit: item.unit,
        qty: item.qty,
        fxprice: item.fxprice,
        discount: item.discount,
        netamount: item.netamount,
        taxcode: item.taxcode,
        vatamount: item.vatamount,
        amount: item.amount
      });
      order.payment.orderDetails.products.push({
        title: item.description,
        code: item.partnumber,
        amount: item.qty,
        price: item.price,
        vat: item.rate * 100,
        discount: item.discount,
        type: 1
      });
      if(item.code.usable === "single") {
        order.fieldvalue.push({
          id: null, fieldname: "customer_code",
          refnumber: customer.custnumber, 
          value: item.code.code, notes: null, deleted: 0 }) }
    });
    if(order.amount === 0){
      order.trans.paid = 1; }

    if (order.items.length > 0) {
      dispatch(sendOrder(order));
    }
  }
}

export const setCode = () => {
  return (dispatch, getState) => {
    
  }
}

export const paginate = ({ page, perPage }) => {
  return (rows = []) => {
    // adapt to zero indexed logic
    const p = page - 1 || 0;

    const amountOfPages = Math.ceil(rows.length / Math.max(isNaN(perPage) ? 1 : perPage, 1));
    const startPage = p < amountOfPages ? p : 0;

    return {
      amount: amountOfPages,
      rows: rows.slice(startPage * perPage, (startPage * perPage) + perPage),
      page: startPage
    };
  };
}