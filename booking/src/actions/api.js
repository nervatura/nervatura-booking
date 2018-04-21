import firebase from 'firebase';
import jsPDF from 'jspdf';
import moment from 'moment';
import 'nervatura/public/js/Report';

const fetchData = (params) => {
  return (dispatch, getState) => {
    const { api_path } = getState().store.def;
    const { appState } = getState().actions.app;

    dispatch(appState("request_sending", true))
    return fetch(api_path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data)})
      .then((response) => {
        if(response.ok){
          return response.json() }
        else {
         return {error: {message: response.statusText, data: ""}}; }})
      .then(
        (data) => {
          dispatch(appState("request_sending", false))
          if ("error" in data) {
            params.callback(data.error.message, data.error.data);} 
          else {
            if ("result" in data) {
              if (Array.isArray(data.result) && data.result.length===1) {
                if (data.result[0].state === false && 
                  typeof data.result[0].error_message !== "undefined") {
                    params.callback(data.result[0].error_message);}
                else {
                  params.callback(null,data.result);}}
              else {
                params.callback(null,data.result);}} 
            else {
              params.callback(null,"OK");}}
        })
      .catch(
        (error) => {
          dispatch(appState("request_sending", false))
          params.callback(error.message)
      });
  }
}

const initData = (id, method) => {
  return {"id":id, "method":method, "params":{}, "jsonrpc":"2.0"};
}

export const getSettings = (callback) => {
  return (dispatch, getState) => {
    const { appData } = getState().actions.app;
    const { database } = getState().store.server.settings;
    let data = initData(1, "getSettings");
    data.params = {alias: database};
    return dispatch(fetchData({data, callback: (err, result)=>{
      if(!err){
        dispatch(appData("server", result));}
      callback(err); }}));
  }
}

export const getDays = () => {
  return (dispatch, getState) => {
    const { appData, showMessage, getText } = getState().actions.app;
    const { database } = getState().store.server.settings;
    let booking = getState().store.booking;
    let data = initData(2, "getDays");
    data.params = {alias: database, fromdate: booking.search.date_from, todate: booking.search.date_to};
    return dispatch(fetchData({data, callback: (err, result)=>{
      if(!err){
        booking.search.result = result;
        dispatch(appData("booking", booking));
        if(result.length === 0){
          dispatch(showMessage({ value: dispatch(getText("msg_no_sess")) })) }}
      else {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          dispatch(showMessage({ value: err })) }}}}));
  }
}

export const getData = (view, user, callback) => {
  return (dispatch, getState) => {
    const { appData, showMessage, setPageView } = getState().actions.app;
    const { database } = getState().store.server.settings;
    let booking = getState().store.booking;
    
    view = view || localStorage.getItem("booking_view") || "customer";
    user = user || firebase.auth().currentUser;
    if(user){
      booking.login.provider = user.providerData[0].providerId;
      if(user.email && (user.emailVerified === false)){
        booking.login.data = { dirty: false, uid: user.email, verified: false }
        booking.view = "verification";
        dispatch(appData("booking", booking)); }
      else {
        user.getIdToken(true).then(function(idToken) {
          let data = initData(3, "getData");
          data.params = {alias: database, idToken: idToken};
          return dispatch(fetchData({data, callback: (err, result)=>{
            if(callback){
              callback(err, result);}
            else {
              if(!err){
                booking.login.data = result;
                dispatch(setPageView({ "view":view, "booking": booking })) 
              }
              else if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
                dispatch(showMessage({ value: err })); }}}}));
        }).catch(function(err) {
          if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            dispatch(showMessage({ value: err })); }});}
    }
  }
}

export const sendMail = () => {
  return (dispatch, getState) => {
    const { showMessage, getText } = getState().actions.app;
    const { database, mail_from } = getState().store.server.settings;
    const { customer, contact } = getState().store.booking.login.data
    const { event, fieldvalue } = getState().store.booking.login.current
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
      let data = initData(7, "sendEmail");
      data.params = {alias: database, idToken: idToken, 
        from: mail_from, email: contact[0].email,
        subject: dispatch(getText('booking_mail_subject')), text: dispatch(getText('booking_mail_text')) };
      data.params.text = data.params.text.replace("$CUSTOMER_NAME", customer.custname);
      data.params.text = data.params.text.replace("$DATE_FROM", moment(event.fromdate,'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'));
      const event_guest = fieldvalue.filter(function(row){
        return ((row.fieldname === "event_guest") && (row.deleted === 0));})[0]
      data.params.text = data.params.text.replace("$GUESTS", event_guest.value);
      return dispatch(fetchData({data, callback: (err, result)=>{ 
        if (err && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')) {
          err = err || result.errorMessage
          dispatch(showMessage({ value: err })); }}}))
    }).catch(function(err) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        dispatch(showMessage({ value: err })); }});
  }
}

export const saveData = (view) => {
  return (dispatch, getState) => {
    const { validForm, showMessage, appData } = getState().actions.app;
    const { database } = getState().store.server.settings;
    let booking = getState().store.booking;

    const validator = dispatch(validForm(view));
    if(!validator.valid){
      return dispatch(showMessage({ value: validator.err })); }
    else {
      firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        let data = initData(4, "setData");
        data.params = {alias:database, idToken:idToken, data:booking.login.current};
        return dispatch(fetchData({data, callback: (err, result)=>{
          if(!err){
            dispatch(getData(null, null, (err, data) => {
              if(err) { dispatch(showMessage({ value: err })); }
              else {
                if(view === "event"){
                  if(booking.login.current.event.id === null) {
                    dispatch(sendMail()); }}
                booking.login.data = data;
                booking.login.current = result;
                booking.login.data.dirty = false;
                dispatch(appData("booking", booking)); }}))}
          else{
            dispatch(showMessage({ value: err })); }}}));
      }).catch(function(err) {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          dispatch(showMessage({ value: err })); }});
    }
  }
}

export const getInvoice = (refnumber) => {
  return (dispatch, getState) => {
    const { reportkey, page_orientation, database } = getState().store.server.settings;
    const { lang } = getState().store.state;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
      let data = initData(5, "getInvoice");
      data.params = {alias: database, idToken: idToken, 
        refnumber: refnumber, 
        reportkey: (reportkey[lang]) ? reportkey[lang] : reportkey["en"]};
      return dispatch(fetchData({data, callback: (err, result)=>{
        if(!err){
          const { template, data } = result.report
          window.jsPDF = jsPDF;
          let rpt = new window.Report(page_orientation);
          rpt.loadDefinition(template);
          for(let i = 0; i < Object.keys(data).length; i++) {
            let pname = Object.keys(data)[i];
            rpt.setData(pname, data[pname]);}
          rpt.createReport();
          rpt.save2PdfFile("Invoice.pdf");
        } 
      }}));
    })
    
  }
}

export const sendOrder = ( order ) => {
  return (dispatch, getState) => {
    const { showMessage } = getState().actions.app;
    const { database } = getState().store.server.settings;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
      let data = initData(6, "setOrder");
      data.params = {alias:database, idToken:idToken, data:order};
      return dispatch(fetchData({data, callback: (err, result)=>{ 
        if(!err && !result.errorCode){
          if(result.url){
            localStorage.setItem("payment", JSON.stringify(result));
            window.location = result.url; }
          else {
            dispatch(getData("packages")); }}
        else if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          err = err || result.errorMessage
          dispatch(showMessage({ value: err })); }}}))
    }).catch(function(err) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        dispatch(showMessage({ value: err })); }});
  }
}

export const initAuth = () => {
  return (dispatch, getState) => {
    const { server, state } = getState().store;
    const { showMessage } = getState().actions.app;

    firebase.initializeApp(server.settings.firebase);
    firebase.auth().languageCode = state.lang;
    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
        dispatch(getData(null, user)); }});
    firebase.auth().getRedirectResult().then(function(result) {
      localStorage.removeItem("redirect");
    }).catch(function(error) {
      localStorage.removeItem("redirect");
      dispatch(showMessage({ value: error.message })); });
    }
}

export const sendVerification = () => {
  return (dispatch, getState) => {
    const { showMessage, getText, appState } = getState().actions.app;
    const { lang } = getState().store.state
    
    firebase.auth().languageCode = lang;
    dispatch(appState("request_sending", true))
    firebase.auth().currentUser.sendEmailVerification().then(function() {
      dispatch(appState("request_sending", false));
      dispatch(showMessage({ value: dispatch(getText('booking_verification_ok')) }));
    }).catch(function(err) {
      dispatch(appState("request_sending", false));
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        dispatch(showMessage({ value: err })); }
    });
  }
}

export const resetPassword = () => {
  return (dispatch, getState) => {
    const { showMessage, appData, appState } = getState().actions.app;
    const { login_email } = getState().store.modal;
    const { lang } = getState().store.state
    
    firebase.auth().languageCode = lang;
    dispatch(appState("request_sending", true));
    firebase.auth().sendPasswordResetEmail(login_email).then(function() {
      dispatch(appState("request_sending", false));
      dispatch(appData("modal", { type: "" }));
    }).catch(function(err) {
      dispatch(appState("request_sending", false));
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        dispatch(showMessage({ value: err })); }
    });
  }
}

export const emailCreate = () => {
  return (dispatch, getState) => {
    const { appData, appState } = getState().actions.app;
    const { lang } = getState().store.state
    let modal = getState().store.modal;
    modal.errorMessage = ""
    if(modal.validationMessage && modal.validationMessage !== ""){
      modal.errorMessage = modal.validationMessage;
      dispatch(appData("modal", modal)); }
    else {
      firebase.auth().languageCode = lang;
      dispatch(appState("request_sending", true));
      firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(modal.login_email, modal.login_password || "").then(function() {
        dispatch(appState("request_sending", false));
        localStorage.setItem("last_email", modal.login_email);
        dispatch(appData("modal", { type: "" }));
      }).catch(function(error) {
        dispatch(appState("request_sending", false));
        modal.errorMessage = error.message; 
        dispatch(appData("modal", modal)); 
      });
    }
  }
}

export const emailLogin = () => {
  return (dispatch, getState) => {
    const { appData, appState } = getState().actions.app;
    const { lang } = getState().store.state
    let modal = getState().store.modal;
    modal.errorMessage = ""
    if(modal.validationMessage && modal.validationMessage !== ""){
      modal.errorMessage = modal.validationMessage;
      dispatch(appData("modal", modal)); }
    else {
      firebase.auth().languageCode = lang;
      dispatch(appState("request_sending", true));
      firebase.auth().signInAndRetrieveDataWithEmailAndPassword(modal.login_email, modal.login_password || "email_check").then(function() {
        dispatch(appState("request_sending", false));
        if(modal.login_state === "email_check"){
          modal.login_state = "email_login";
          dispatch(appData("modal", modal)); }
        else {
          localStorage.setItem("last_email", modal.login_email);
          dispatch(appData("modal", { type: "" }));}
      }).catch(function(error) {
        dispatch(appState("request_sending", false));
        if (error.code === 'auth/user-not-found') {
          modal.login_state = "email_create"; }
        else if ((modal.login_state === "email_check") && (error.code === 'auth/wrong-password')) {
          modal.login_state = "email_login";
        } else {
          modal.errorMessage = error.message; }
        dispatch(appData("modal", modal)); 
      });
    }
  }
}

export const phoneLogin = () => {
  const resetReCaptcha = () => {
    if (typeof grecaptcha !== 'undefined' && typeof window.recaptchaWidgetId !== 'undefined') {
      window.grecaptcha.reset(window.recaptchaWidgetId); }}

  return (dispatch, getState) => {
    const { appData, getText } = getState().actions.app;
    const { lang } = getState().store.state
    let modal = getState().store.modal;
    modal.errorMessage = ""
    if((modal.country_code === "") || (modal.login_phone === "") || 
      (!modal.login_phone) || (String(modal.login_phone).length<=4)){
      modal.errorMessage = dispatch(getText('booking_login_phone_number_err'));
      dispatch(appData("modal", modal));
      resetReCaptcha(); }
    else {
      firebase.auth().languageCode = lang;
      modal.phone_number = modal.country_code+modal.login_phone;
      const appVerifier = window.recaptchaVerifier;
      firebase.auth().signInWithPhoneNumber(modal.phone_number, appVerifier).then(function(confirmationResult) {
        localStorage.setItem("last_phone", modal.login_phone);
        modal.login_state = "phone_verify";
        window.confirmationResult = confirmationResult;
        dispatch(appData("modal", modal));
      }).catch(function(error) {
        switch (error.code) {
          case "auth/invalid-phone-number":
          case "auth/missing-phone-number":
            modal.errorMessage = dispatch(getText('booking_login_phone_number_err'));
            resetReCaptcha();
            break;
          
          case "auth/quota-exceeded":
          case "auth/user-disabled":
          case "auth/operation-not-allowed":
            window.recaptchaVerifier = null;
            window.recaptchaWidgetId = null;
            break;
        
          case "auth/captcha-check-failed":
          default:
            modal.errorMessage = error.message;
            resetReCaptcha();
            break;
        }
        dispatch(appData("modal", modal));
      });
    }
  }
}

export const phoneVerify = () => {
  return (dispatch, getState) => {
    const { appData, getText, appState } = getState().actions.app;
    const { lang } = getState().store.state
    let modal = getState().store.modal;
    modal.errorMessage = ""
    if(String(modal.login_code).length !== 6){
      modal.errorMessage = dispatch(getText('booking_login_phone_number_err'));
      dispatch(appData("modal", modal)); }
    else {
      firebase.auth().languageCode = lang;
      dispatch(appState("request_sending", true));
      window.confirmationResult.confirm(modal.login_code).then(function (result) {
        dispatch(appState("request_sending", false));
        dispatch(appData("modal", { type: "" }));
      }).catch(function (error) {
        dispatch(appState("request_sending", false));
        modal.errorMessage = error.message;
        dispatch(appData("modal", modal));
      });
    }
  }
}

export const signOut = () => {
  return (dispatch, getState) => {
    const { appData } = getState().actions.app;
    let booking = getState().store.booking;
    firebase.auth().signOut().then(function() {
      booking.login = { data:{}, current:{} };
      booking.view = "search";
      dispatch(appData("booking", booking));
    }).catch(function(error) {});
  }
}