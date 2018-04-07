/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2018, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

var express = require('express');
var router = express.Router();

var async = require("async");
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

var https = require('https');

var models = require('nervatura').adapter.models();
var connect = require('nervatura').adapter.connect();
var ntool = require('nervatura').tools.NervaTools();
var out = require('nervatura').tools.DataOutput();

var settings = JSON.parse(JSON.stringify(require('../conf/settings.json')));

router.use(function (req, res, next) {
  next()
});

router.get('/', function (req, res, next) {
  index(req.query, req, res);});

router.post('/', function (req, res, next) {
  index(req.body, req, res);});

router.get('/payment/success', function (req, res, next) {
  var params = { method: "paymentResults", params: req.query};
  params.params.result = "success";
  index(params, req, res);});

router.get('/payment/failure', function (req, res, next) {
  var params = { method: "paymentResults", params: req.query};
  params.params.result = "failure";
  index(params, req, res);});

router.get('/payment/notify', function (req, res, next) {
  var params = { method: "paymentResults", params: req.query};
  params.params.result = "notify";
  index(params, req, res);});

function getGoogleCerts(app, callback) {
  if(!app.get("google_certs")){
    https.get(settings.CLIENT_CERT_URL, function(res) {

      if (res.statusCode !== 200) {
        res.resume();
        callback(res.statusCode); }

      res.setEncoding('utf8');
      var rawData = '';
      res.on('data', function(chunk) { 
        rawData += chunk; });
      res.on('end', function() {
        try {
          const parsedData = JSON.parse(rawData);
          app.set("google_certs", parsedData); 
          callback(null, parsedData);} 
        catch (err) {
          callback(err.message); }}
        );
    }).on('error', function(err) {
      callback(err.message); });
  }
  else {
    callback(null, app.get("google_certs"));
  }
}

function get_invoice(nstore, params, _callback) {

  async.waterfall([
    function(callback) {
      if(!params.idToken){
        callback(nstore.lang().missing_params+": idToken"); }
      else if(!params.refnumber){
        callback(nstore.lang().missing_params+": refnumber"); }
      else if(!params.reportkey){
        callback(nstore.lang().missing_params+": reportkey"); }
      else {
        callback(null, { refnumber: params.refnumber }); }
    },

    function(data, callback) {
      var paramList = { nervatype: "trans", refnumber: params.refnumber, 
        reportkey: params.reportkey, output: "tmp" }
      ntool.getReport(nstore, paramList, function(err, report){
        if(!err){
          data.report = report; }
        callback(err, data);
      });
    }
  ],
  function(err, data) {
    if(params.validator){
      if (params.validator.conn) {
        params.validator.conn.close(); params.validator.conn = null;}}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, data);
  })
}

function send_email(nstore, params, _callback) {

  async.waterfall([
    function(callback) {
      if(!params.idToken){
        callback(nstore.lang().missing_params+": idToken"); }
      else if(!params.from){
        callback(nstore.lang().missing_params+": from"); }
      else if(!params.email){
        callback(nstore.lang().missing_params+": email"); }
      else {
        callback(null); }
    },

    function(callback) {
      var paramList = { provider: "smtp", 
        email: {
          from: params.from, recipients :[{ email: params.email }],
          subject: params.subject || "", text: params.text || "", html: params.html || "",
          attachments: params.attachments || [] } }
      ntool.sendEmail(nstore, paramList, function(err, result){
        callback(err, result);
      });
    }
  ],
  function(err, result) {
    if(params.validator){
      if (params.validator.conn) {
        params.validator.conn.close(); params.validator.conn = null;}}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, result);
  })
}

function get_data(nstore, params, _callback) {

  function setPackages(data) {
    var packages = {}; var results = [];
    data.forEach(row => {
      if(!packages[row.id]){
        packages[row.id] = { pkey: row.id,
          ecode: row.ecode, qty: row.qty, description: row.description, partnumber: row.partnumber, 
          transdate: moment(row.transdate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          edate: {}, events: [] }}
      if(row.fromdate){
        packages[row.id].edate = moment(row.fromdate, 'YYYY-MM-DD').format('YYYY-MM-DD'); }
      if(row.calnumber){
        packages[row.id].events.push(row.calnumber); }});
    for (const pkey in packages) {
      switch (packages[pkey].ecode) {
        case "P01":
          packages[pkey].available = (1 - packages[pkey].events.length);
          packages[pkey].valid = (packages[pkey].events.length === 0) ? true : false;
          break;
        case "P05":
          packages[pkey].qty = packages[pkey].qty * 5;
          packages[pkey].available = (5 - packages[pkey].events.length);
          packages[pkey].valid = (packages[pkey].events.length <= 5) ? true : false;
          break;
        case "P10":
          packages[pkey].qty = packages[pkey].qty * 10;
          packages[pkey].available = (10 - packages[pkey].events.length);
          packages[pkey].valid = (packages[pkey].events.length <= 10) ? true : false;
          break;
        case "M03":
          packages[pkey].expiration = moment(packages[pkey].transdate, 'YYYY-MM-DD').add(3, "months").format('YYYY-MM-DD');
          packages[pkey].valid = moment(packages[pkey].expiration, 'YYYY-MM-DD').isSameOrAfter(moment());
          break;
        case "M12":
          packages[pkey].expiration = moment(packages[pkey].transdate, 'YYYY-MM-DD').add(12, "months").format('YYYY-MM-DD');
          packages[pkey].valid = moment(packages[pkey].expiration, 'YYYY-MM-DD').isSameOrAfter(moment())
          break;
        default:
          break;}
      results.unshift(packages[pkey]);}
    return results; }

  async.waterfall([
    function(callback) {
      if(!params.idToken){
        callback(nstore.lang().missing_params+": idToken"); }
      else if(!params.custnumber){
        callback(nstore.lang().missing_params+": custnumber"); }
      else {
        callback(null, { dirty: false, uid: params.custnumber }); }
    },

    function(data, callback) {
      var _sql = [
        { "select":["*"], "from":"groups",
          "where": [["groupname","=","'custtype'"],
            ["and","groupvalue","in",[[],"'private'","'company'","'other'"]]] },
        { "union_select":["*"], "from":"groups",
          "where": [["groupname","=","'nervatype'"],["and","groupvalue","=","'customer'"]]},
        { "union_select":["*"], "from":"groups",
          "where": [["groupname","=","'eventgroup'"],["and","groupvalue","=","'paid_session'"]]},
        { "union_select":["*"], "from":"groups",
          "where": [["groupname","=","'eventgroup'"],["and","groupvalue","=","'free_session'"]]} ]
      params.validator.conn.query(models.getSql(nstore.engine(), _sql), [], function (err, result) {
        if(!err){
          data.defvalues = {}
          result.rows.forEach(row => {
            data.defvalues[row.groupname+"_"+row.groupvalue] = row.id });}
        callback(err, data); }); 
    },

    function(data, callback) {
      var _sql = { "select":["*"], "from":"customer", 
        "where":[["deleted","=","0"],["and","custnumber","=","?"]]}
      params.validator.conn.query(models.getSql(nstore.engine(), _sql), [params.custnumber], function (err, result) {
        if(!err){
          if(result.rows.length > 0){
            data.customer = result.rows[0]; }}
        callback(err, data); }); 
    },

    function(data, callback) {
      if(data.customer){
        var _sql = { "select":["*"], "from": "address", 
          "where": [
            ["deleted","=","0"], ["and","nervatype","=",[
            {"select":["id"], "from":"groups", 
            "where":[["groupname","=","'nervatype'"],["and","groupvalue","=","'customer'"]]}]],
            ["and","ref_id","=","?"]]}
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.address = result.rows;}
          callback(err, data); });}
      else {
        callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = { "select":["*"], "from": "contact", 
          "where": [
            ["deleted","=","0"], ["and","nervatype","=",[
            {"select":["id"], "from":"groups", 
            "where":[["groupname","=","'nervatype'"],["and","groupvalue","=","'customer'"]]}]],
            ["and","ref_id","=","?"]]}
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.contact = result.rows;}
          callback(err, data); });}
        else {
          callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = { "select":["*"], "from": "event", 
          "where": [
            ["deleted","=","0"], ["and","nervatype","=",[
            {"select":["id"], "from":"groups", 
            "where":[["groupname","=","'nervatype'"],["and","groupvalue","=","'customer'"]]}]],
            ["and","ref_id","=","?"]],
          "order_by":["fromdate desc"]}
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.event = result.rows;}
          callback(err, data); });}
      else {
        callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = [
          { "select":["*"], "from": "fieldvalue", 
            "where": [
              ["deleted","=","0"], ["and","fieldname","in",[[],"'customer_code'"]],
              ["and","ref_id","=",data.customer.id]] },
          { "union_select":["*"], "from": "fieldvalue", 
            "where": [
              ["deleted","=","0"], ["and","fieldname","in",[[],"'event_guest'","'event_ticket'"]],
              ["and","ref_id","in",[{ 
                "select":["id"], "from": "event", 
                "where": [
                  ["deleted","=","0"], ["and","nervatype","=",[
                  {"select":["id"], "from":"groups", 
                  "where":[["groupname","=","'nervatype'"],["and","groupvalue","=","'customer'"]]}]],
                  ["and","ref_id","=","?"]]}]]] }]
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.fieldvalue = result.rows;}
          callback(err, data); });}
        else {
          callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = {
          select: ["t.id as id", "fv.value as transcast", "t.transnumber", "t.ref_transnumber",
            "t.crdate", "t.transdate", "t.duedate", "ptg.groupvalue as paidtype","t.curr",
            "case when irow.netamount is null then 0 else irow.netamount end as netamount",
            "case when irow.vatamount is null then 0 else irow.vatamount end as vatamount",
            "case when irow.amount is null then 0 else irow.amount end as amount",
            "t.paid","t.acrate","t.notes","t.intnotes", "sg.groupvalue as transtate","t.closed","t.deleted"],
          from:"trans t",
          inner_join:[
            ["groups tg","on",[["t.transtype","=","tg.id"],["and","tg.groupvalue","=","'invoice'"]]],
            ["groups dg","on",[["t.direction","=","dg.id"],["and","dg.groupvalue","=","'out'"]]],
            ["groups ptg","on",["t.paidtype","=","ptg.id"]],
            ["groups sg","on",["t.transtate","=","sg.id"]]],
          left_join:[
            ["fieldvalue fv","on",[["t.id","=","fv.ref_id"],["and","fv.fieldname","=","'trans_transcast'"]]],
            [[[{select:["trans_id","sum(netamount) as netamount","sum(vatamount) as vatamount","sum(amount) as amount"],
              from:"item", where:["deleted","=","0"], group_by:["trans_id"]}],"irow"],"on",["t.id","=","irow.trans_id"]]],
          where:[["t.deleted","=","0"],["and","t.customer_id","=","?"]],
          order_by:["t.id desc"] }
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.invoice = result.rows;}
          callback(err, data); });}
        else {
          callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = {
          select: ["i.id", "i.qty", "i.description", "p.partnumber", "pe.value as ecode", "t.transdate", "sess.fromdate", "sess.calnumber"],
          from: "item i",
          inner_join: [
            ["product p", "on", [["i.product_id", "=", "p.id"],["and","p.webitem","=","1"]]],
            ["fieldvalue pe","on",[["p.id","=","pe.ref_id"],["and","pe.fieldname","=","'product_expiry'"]]],
            ["trans t", "on", [[["i.trans_id", "=", "t.id",],["and", "t.deleted", "=", "0"]]]],
            ["groups tg","on",[["t.transtype","=","tg.id"]]],
            ["groups dg","on",[["t.direction","=","dg.id"],["and","dg.groupvalue","=","'out'"]]]],
          left_join: [
            [{select: ["{CAS_INT}fv.value {CAE_INT} as pid", "e.fromdate", "e.calnumber"],
            from: "fieldvalue fv",
            inner_join: ["event e", "on", [[["fv.ref_id", "=", "e.id"], ["and", "e.deleted", "=", "0"]]]],
            where: [["fv.deleted", "=", "0"], ["and", "fv.fieldname", "=", "'event_ticket'"]]}], "sess", "on", ["i.id", "=", "sess.pid"]
          ],
          where: [["i.deleted", "=", "0"], 
            ["and",[["tg.groupvalue","=","'invoice'"],"or",[["tg.groupvalue","=","'order'"],["and","t.paid","=","1"]]]], 
            ["and", "t.customer_id", "=", "?"]],
          order_by: ["i.id desc"] }
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.packages = setPackages(result.rows);}
          callback(err, data); });}
        else {
          callback(null, data); }
    },

    function(data, callback) {
      if(data.customer){
        var _sql = {
          select:["t.transnumber as order_no", "ti.transnumber as invoice_no", "t.paid", "t.deleted"],
          from: "trans t",
          inner_join: [
            ["groups tg", "on", [["t.transtype", "=", "tg.id"], ["and", "tg.groupvalue", "=", "'order'"]]],
            ["groups dg", "on", [["t.direction", "=", "dg.id"], ["and", "dg.groupvalue", "=", "'out'"]]]],
          left_join: [
            ["link l", "on", [["l.ref_id_2", "=", "t.id"],
              ["and", "l.nervatype_2", "=", [
                {select: ["id"], from: "groups", where: [["groupname", "=", "'nervatype'"], ["and", "groupvalue", "=", "'trans'"]]}]], 
              ["and", "l.nervatype_1", "=", [ 
                {select: ["id"], from: "groups", where: [["groupname", "=", "'nervatype'"], ["and", "groupvalue", "=", "'trans'"]]} ]]]],
            ["trans ti", "on", ["l.ref_id_1", "=", "ti.id"]]],
          where: ["t.customer_id", "=", "?"] }
        params.validator.conn.query(models.getSql(nstore.engine(), _sql), [data.customer.id], function (err, result) {
          if(!err){
            data.order = result.rows;}
          callback(err, data); });}
        else {
          callback(null, data); }
    },

  ],
  function(err, data) {
    if (params.validator.conn) {
      params.validator.conn.close(); params.validator.conn = null;}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, data);
  })
}

function get_days(nstore, params, _callback) {

  function checkRules(sRules, BookCount, mDay, sDay){
    function isRange(rule){
      return (rule.fromdate.isSameOrBefore(mDay) || 
        isNaN(rule.fromdate)) && (rule.todate.isSameOrAfter(mDay) || isNaN(rule.todate));}
    function getBookCount(events){
      events = JSON.parse(JSON.stringify(events));
      return events.map(event => {
        BookCount.forEach(sess => {
          if(moment(sess.fromdate, 'YYYY-MM-DD hh:mm').isSame(moment(sDay.date+" "+event.start_time, 'YYYY-MM-DD hh:mm'))){
            event.qty = parseInt(sess.scount, 10);
            return; }});
        return event;});}

    if(sRules[8]){
      //custom rule
      for (const id in sRules[8]) {
        if(isRange(sRules[8][id])){
          sDay.events = getBookCount(sRules[8][id].events);
          return sDay; }}}
    if(sRules[sDay.weekday]){
      //weekday rule
      for (const id in sRules[sDay.weekday]) {
        if(isRange(sRules[sDay.weekday][id])){
          sDay.events = getBookCount(sRules[sDay.weekday][id].events);
          return sDay; }}}
    if(sRules[0]){
      //gen. rule
      for (const id in sRules[0]) {
        if(isRange(sRules[0][id])){
          sDay.events = getBookCount(sRules[0][id].events);
          return sDay; }}}
    return sDay; }

  async.waterfall([
    function(callback) {
      if(!params.fromdate || !params.todate){
        callback(nstore.lang().missing_params+": fromdate, todate"); }
      else {
        callback(null); }
    },

    function(callback) {   
      var _sql = { "select":["e.id", "eg.groupvalue as evgroup","{FMS_DATE}fromdate {FME_DATE} as fromdate",
          "{FMS_DATE}todate {FME_DATE} as todate", "e.subject", "e.place", "fv.fieldname", 
          "fv.value", "fv.notes as snote", "dt.value as def_time", "dq.value as def_qty"], 
        "from":"event e",
        "inner_join":[
          ["groups nt","on",[["e.nervatype","=","nt.id"],["and","nt.groupvalue","=","'customer'"]]],
          ["groups eg","on",["e.eventgroup","=","eg.id"]],
          ["fieldvalue dt","on",[["dt.ref_id","is","null"],["and","dt.fieldname","=","'def_ses_time'"]]],
          ["fieldvalue dq","on",[["dq.ref_id","is","null"],["and","dq.fieldname","=","'def_ses_qty'"]]]],
        "left_join":[
          "fieldvalue fv","on",[["fv.ref_id","=","e.id"],["and","fv.fieldname","in",[[],"'ses_start'","'ses_end'","'ses_qty'"]]]],
        "where": [["e.deleted","=","0"],["and","e.ref_id","=","1"]],
        "order_by":["e.fromdate","e.id","fv.value"]};
      _sql.where.push(["and",[["{CAS_DATE}e.fromdate{CAE_DATE}","<=","?"],["or","e.fromdate","is","null"]]]);
      _sql.where.push(["and",[["{CAS_DATE}e.todate{CAE_DATE}",">=","?"],["or","e.todate","is","null"]]])
      var conn = nstore.connect.getConnect()
      conn.query(models.getSql(nstore.engine(),_sql), [params.todate, params.fromdate], function (err, result) {
        callback(err, {conn: conn, rules: result}); });
    },

    function(validator, callback) {   
      var _sql = { 
        select: ["e.fromdate", "sum({CAS_INT}fv.value {CAE_INT}) as scount"],
        from: "event e",
        inner_join: [
          ["groups eg", "on", [["e.eventgroup", "=", "eg.id"], 
            ["and", "eg.groupvalue", "in", [[], "'paid_session'", "'free_session'"]]]],
          ["fieldvalue fv", "on", [["fv.fieldname", "=", "'event_guest'"], 
            ["and", "e.id", "=", "fv.ref_id"], ["and", "fv.deleted", "=", "0"]]]],
        where: [["e.deleted", "=", "0"]], group_by: ["e.fromdate"]
      };
      _sql.where.push(["and",[["{CAS_DATE}e.fromdate{CAE_DATE}","<=","?"],["or","e.fromdate","is","null"]]]);
      _sql.where.push(["and",[["{CAS_DATE}e.todate{CAE_DATE}",">=","?"],["or","e.todate","is","null"]]])
      
      validator.conn.query(models.getSql(nstore.engine(),_sql), [params.todate, params.fromdate], function (err, result) {
        validator.bookCount = result.rows;
        callback(err, validator); });
    },

    function(validator, callback) {
      validator.sRules = {}
      if (validator.rules.rowCount > 0) {
        validator.sRules["def_time"] = parseInt(String(validator.rules.rows[0].def_time).split(":")[0],10)*60 + parseInt(String(validator.rules.rows[0].def_time).split(":")[1],10)
        validator.sRules["def_qty"] = isNaN(parseInt(validator.rules.rows[0].def_qty,10)) ? 0 : parseInt(validator.rules.rows[0].def_qty,10);
        validator.rules.rows.forEach(rule => {
          var eid = [ "OPEN_WEEK", "OPEN_MONDAY", "OPEN_TUESDAY", "OPEN_WEDNESDAY", "OPEN_THURSDAY", 
            "OPEN_FRIDAY", "OPEN_SATURDAY", "OPEN_SUNDAY", "OPEN_CUSTOM"].indexOf(rule.evgroup)
          if(eid > -1){
            if(!validator.sRules[eid]){
              validator.sRules[eid] = {} }
            if(!validator.sRules[eid][rule.id]){
              validator.sRules[eid][rule.id] = {
                fromdate: moment(rule.fromdate, 'YYYY-MM-DD'),
                todate: moment(rule.todate, 'YYYY-MM-DD'), 
                place: rule.place, events:[] } }
            if(rule.fieldname !== null){
              if(rule.fieldname === "ses_start"){
                var cqty = validator.sRules["def_qty"]
                if(!isNaN(parseInt(rule.snote,10))){
                  cqty = parseInt(rule.snote,10); }
                validator.sRules[eid][rule.id].events.push({
                  start_time: rule.value,
                  end_time: moment(rule.value, 'hh:mm').add(validator.sRules["def_time"],'m').format('HH:mm'),
                  sess_time: validator.sRules["def_time"],
                  sess_id: moment(rule.value, 'hh:mm').format('X'),
                  am_pm: moment(rule.value, 'hh:mm').format('A'),
                  free: (rule.snote === "FREE"),
                  qty: 0,
                  capacity: cqty })}
              else if(rule.fieldname === "ses_end"){
                if(validator.sRules[eid][rule.id].events.length > 0) {
                  var srule = validator.sRules[eid][rule.id].events[validator.sRules[eid][rule.id].events.length-1];
                  if(moment(srule.start_time, 'hh:mm').isBefore(moment(rule.value, 'hh:mm'))){
                    srule.end_time = rule.value;
                    srule.sess_time = moment(rule.value, 'hh:mm').diff(moment(srule.start_time, 'hh:mm'),'minutes'); }}}}}});}
      callback(null, validator);
    },

    function(validator, callback) {
      validator.sApps = {}
      callback(null, validator);
    },

    function(validator, callback) {
      var dateRange = moment.range(moment(params.fromdate, 'YYYY-MM-DD'), moment(params.todate, 'YYYY-MM-DD'));
      validator.data = []
      for (var day of dateRange.by('days')) {
        var sDay = checkRules(validator.sRules, validator.bookCount, day, {
          date: day.format('YYYY-MM-DD'),
          weekday: day.isoWeekday(),
          events: [] });
        if(sDay.events.length > 0){
          validator.data.push(sDay); }}
      callback(null, validator);
    }
  ],
  function(err, validator) {
    if(validator){
      if (validator.conn) {
        validator.conn.close(); validator.conn = null;}
      validator = validator.data;}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, validator);
  })
}

function set_data(nstore, params, _callback) {

  async.waterfall([
    function(callback) {
      var data = params.data; data.dirty = false;
      params.validator.trans = connect.beginTransaction({connection: params.validator.conn, engine:nstore.engine()});
      if(!params.idToken){
        callback(nstore.lang().missing_params+": idToken", data); }
      else if(!params.custnumber){
        callback(nstore.lang().missing_params+": custnumber", data); }
      else {
        callback(null, data); }
    },

    function(data, callback) {
      var update_params = {insert_row: true, transaction: params.validator.trans};
      if(data.customer){
        update_params.nervatype = "customer"; 
        update_params.values = data.customer;}
      else {
        update_params.nervatype = "event"; 
        update_params.values = data.event;}
      nstore.connect.updateData(update_params, function(err, record_id){
        if (!err) {
          if (data[update_params.nervatype].id === null){
            data[update_params.nervatype].id = record_id;}
          data.ref_id = record_id;}
        callback(err, data); });
    },

    function(data, callback) {
      if(data.address){
        var results_lst = [];
        data.address.forEach(function(record) {
          if(record.ref_id === null){ record.ref_id = data.ref_id; }
          var update_params = {nervatype:"address", values:record, 
            insert_row: true, transaction: params.validator.trans};
          results_lst.push(function(callback_){
            nstore.connect.updateData(update_params, function(err, record_id){
              if (!err) {
                if (record.id === null){
                  record.id = record_id;}}
              callback_(err); }); });});
        async.series(results_lst,function(err) {
          callback(err, data); }); }
      else {
        callback(null, data); }
    },

    function(data, callback) {
      if(data.contact){
        var results_lst = [];
        data.contact.forEach(function(record) {
          if(record.ref_id === null){ record.ref_id = data.ref_id; }
          var update_params = {nervatype:"contact", values:record, 
            insert_row: true, transaction: params.validator.trans};
          results_lst.push(function(callback_){
            nstore.connect.updateData(update_params, function(err, record_id){
              if (!err) {
                if (record.id === null){
                  record.id = record_id;}}
              callback_(err); }); });});
        async.series(results_lst,function(err) {
          callback(err, data); }); }
      else {
        callback(null, data); }
    },

    function(data, callback) {
      if(data.fieldvalue){
        var results_lst = [];
        data.fieldvalue.forEach(function(record) {
          if(record.ref_id === null){ record.ref_id = data.ref_id; }
          var update_params = {nervatype: "fieldvalue", values: record, 
            insert_row: true, transaction: params.validator.trans};
          results_lst.push(function(callback_){
            nstore.connect.updateData(update_params, function(err, record_id){
              if (!err) {
                if (record.id === null){
                  record.id = record_id;}}
              callback_(err); }); });});
        async.series(results_lst,function(err) {
          callback(err, data); }); }
      else {
        callback(null, data); }
    }
  ],
  function(err, data) {
    if(err){
      if(params.validator.trans.rollback){
        params.validator.trans.rollback(function (error) {
          if (params.validator.conn){
            params.validator.conn.close(); params.validator.conn = null;}
          _callback(err, data);});}
      else{
        if (params.validator.conn){
          params.validator.conn.close(); params.validator.conn = null;}
        _callback(err, data);}}
    else{
      if(params.validator.trans.commit){
        params.validator.trans.commit(function (err) {
          if (params.validator.conn){
            params.validator.conn.close(); params.validator.conn = null;}
          _callback(err, data);});}
      else{
        if (params.validator.conn){
          params.validator.conn.close(); params.validator.conn = null;}
        _callback(err, data);}
    }
  })
}

function get_settings(nstore, params, _callback) {

  async.waterfall([

    function(callback) {   
      var _sql = { "select":["p.*","t.taxcode","t.rate"], 
        "from":"product p",
        "inner_join":[["tax t","on",["p.tax_id","=","t.id"]],
          ["fieldvalue fv","on",[["p.id","=","fv.ref_id"],["and","fv.fieldname","=","'product_expiry'"]]]],
        "where":[["p.deleted","=","0"],["and","p.webitem","=","1"]],
        "order_by":["p.id desc"]}
      var conn = nstore.connect.getConnect()
      conn.query(models.getSql(nstore.engine(),_sql), [], function (err, result) {
        callback(err, {conn: conn, data: { settings: settings.CLIENT_SETTINGS,  product: result.rows }}); });
    },

    function(validator, callback) {
      var _sql = { "select":["pr.*","p.partnumber","c.digit"], "from":"price pr",
        "inner_join": [
          ["product p","on",[["pr.product_id","=","p.id"],["and","p.webitem","=","1"],["and","p.deleted","=","0"]]],
          ["fieldvalue fv","on",[["p.id","=","fv.ref_id"],["and","fv.fieldname","=","'product_expiry'"]]],
          ["currency c","on",["pr.curr","=","c.curr"]]],
        "where":[["pr.deleted","=","0"],
          ["and","pr.validfrom","<=","?"], ["and",[[["pr.validto",">=","?"]],["or",["pr.validto","is","null"]]]]] }
      validator.conn.query(models.getSql(nstore.engine(),_sql), [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")], 
        function (err, result) {
          if(!err){
            validator.data.price = result.rows; }
          callback(err, validator); })
    }

  ],
  function(err, validator) {
    if(validator){
      if (validator.conn) {
        validator.conn.close(); validator.conn = null;}
      validator = validator.data;}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, validator);
  })
}

function init_database(nstore, params, _callback) {
  //http://localhost:8080/api?method=initDatabase&alias=demo
  var data = JSON.parse(JSON.stringify(require('../conf/dbs.json')));
  var ndi = require('nervatura').ndi(nstore.lang());
  
  async.waterfall([

    function(callback) {
      var results=[];
      results.push({start_process:true, database:params.alias, 
      stamp: moment().format('YYYY-MM-DD HH:mm') });
        var ndi_params = { check_audit: false,
          validator: { conn: nstore.connect.getConnect() },
          log_enabled: false, insert_row: true, insert_field: true }
      callback(null, results, ndi_params);
    },

    function(results, ndi_params, callback) {
      var results_lst = [];
      for (const key in data) {
        results_lst.push(function(callback_){
          ndi_params.datatype = key;
          ndi.updateData(nstore, ndi_params, data[key], function(err, result){
            if (!err){
              results.push({start_group:true, end_group:true, 
                datatype:ndi_params.datatype, result:result.data});}
            else {
              err += " ("+key+")"}
            callback_(err);}); });};
      async.series(results_lst,function(err) {
        callback(err, results, ndi_params); }); 
    },

  ],
  
  function(err, results, params) {
    if (params.hasOwnProperty("validator")){
      if (params.validator.conn !== null){
        params.validator.conn.close();}}
    if(err){
      results.push({error:err, stamp: moment().format('YYYY-MM-DD HH:mm') });}
    else {
      results.push({end_process:true, stamp: moment().format('YYYY-MM-DD HH:mm') });}
    _callback(err, results);});
}

function set_order(nstore, params, _callback) {
  var ndi = require('nervatura').ndi(nstore.lang());
  
  async.waterfall([
    function(callback) {
      if(!params.idToken){
        callback(nstore.lang().missing_params+": idToken"); }
      else {
        params.ndi = { check_audit: false,
          validator: params.validator,
          log_enabled: false, insert_row: true, insert_field: true }
        callback(null); }
    },

    function(callback) {
      if((params.data.amount > 0) && params.data.payment){
        params.data.payment.urlSet = {
          success: settings.PAYMENT.RESPONSE.host+"/api/payment/success",
          failure: settings.PAYMENT.RESPONSE.host+"/api/payment/failure",
          notification: settings.PAYMENT.RESPONSE.host+"/api/payment/notify" }
        var options = {
          host: settings.PAYMENT.SERVICE.host,
          path: settings.PAYMENT.SERVICE.path,
          method: "POST",
          auth: settings.PAYMENT.MERCHANT.id+":"+settings.PAYMENT.MERCHANT.secret,
          headers: {
            "Content-Type": "application/json" }};
        if(settings.PAYMENT.HEADERS){
          settings.PAYMENT.HEADERS.forEach(header => {
            options.headers[header.name] = header.value; });}
        var req = https.request(options, function (res) {
          var rawData = "";
          res.setEncoding('utf8');
          res.on('data', function (data) {
            rawData += data; });
          res.on("end", function () {
            try {
              const parsedData = JSON.parse(rawData);
              callback(null, parsedData); } 
            catch (err) {
              callback(err.message); }});});

        req.on('error', (err) => {
          callback(err.message); });
        req.write(JSON.stringify(params.data.payment));
        req.end();}
      else {
        callback(null, { orderNumber: params.data.trans.transnumber }); }
    },

    function(results, callback) {
      if(params.data.trans){
        params.ndi.datatype = "trans";
        ndi.updateData(nstore, params.ndi, [params.data.trans], function(err, result){
          callback(err, results);}); }
      else{
        callback(null, results); }
    },

    function(results, callback) {
      if(params.data.items){
        params.ndi.datatype = "item";
        ndi.updateData(nstore, params.ndi, params.data.items, function(err, result){
          callback(err, results);}); }
      else{
        callback(null, results); }
    },

    function(results, callback) {
      if(params.data.fieldvalue){
        params.ndi.datatype = "fieldvalue";
        ndi.updateData(nstore, params.ndi, params.data.fieldvalue, function(err, result){
          callback(err, results);}); }
      else{
        callback(null, results); }
    }
  
  ],
  function(err, results) {
    if(params.validator){
      if (params.validator.conn) {
        params.validator.conn.close(); params.validator.conn = null;}}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, results||{});
  })
}

function payment_results(nstore, params, _callback) {
  var ndi = require('nervatura').ndi(nstore.lang());
  var results = { url: settings.PAYMENT.RESPONSE.failure, redirect: true, data: {} }
  function get_valid(values) {
    values = values.join('|');
    values = out.createHash(values,"hex");
    return (values.toUpperCase() === params.RETURN_AUTHCODE); }

  async.waterfall([
    function(callback) {
      switch (params.result) {
        case "success":
          results.url = settings.PAYMENT.RESPONSE.success;
          results.valid = get_valid([params.ORDER_NUMBER, params.TIMESTAMP, 
            params.PAID, params.METHOD, settings.PAYMENT.MERCHANT.secret])
          results.payment_method = settings.PAYMENT.METHOD[params.METHOD] || settings.PAYMENT.METHOD["0"]
          break;
        case "failure":
          results.valid = get_valid([params.ORDER_NUMBER, params.TIMESTAMP, settings.PAYMENT.MERCHANT.secret])
          break;
        case "notify":
          break;
        default:
          break;}
      callback(null);
    },

    function(callback) {
      if(results.valid){
        results.ndi = { check_audit: false,
          validator: {
            conn: nstore.connect.getConnect(),
            data: params.data },
          log_enabled: false, insert_row: true, insert_field: true }
        switch (params.result) {
          case "failure":
            results.ndi.datatype = "trans";
            ndi.deleteData(nstore, results.ndi, [{"transnumber": params.ORDER_NUMBER}], function(err, result){
              callback(err);});
            break;
          
          case "success":
            var _sql = { 
              select: ["t.crdate", "t.transdate", "t.duedate", "c.custnumber", "pt.groupvalue as paidtype", "t.curr", "e.username",
                "p.partnumber", "i.description", "i.unit", "i.qty", "i.fxprice", "i.discount", "i.netamount", 
                "tx.taxcode", "i.vatamount", "i.amount", "cu.digit"],
              from: "trans t",
              inner_join: [
                ["customer c", "on", ["t.customer_id", "=", "c.id"]],
                ["groups pt", "on", ["t.paidtype", "=", "pt.id"]],
                ["employee e", "on", ["t.cruser_id", "=", "e.id"]],
                ["item i", "on", [["t.id", "=", "i.trans_id"], ["and", "i.deleted", "=", "0"]]],
                ["product p", "on", ["i.product_id", "=", "p.id"]],
                ["tax tx", "on", ["i.tax_id", "=", "tx.id"]],
                ["currency cu","on",["t.curr","=","cu.curr"]]],
              where: ["transnumber", "=", "?"] }
            results.ndi.validator.conn.query(models.getSql(nstore.engine(), _sql), [params.ORDER_NUMBER], 
              function (err, result) {
              if(!err){
                if(result.rows.length > 0){
                  results.data = {
                    trans: {
                      transtype: "invoice",
                      direction: "out",
                      crdate: moment(result.rows[0].crdate).format('YYYY-MM-DD'),
                      transdate: moment(result.rows[0].transdate).format('YYYY-MM-DD'),
                      duedate: moment(result.rows[0].duedate).format('YYYY-MM-DD 00:00'),
                      ref_transnumber: params.ORDER_NUMBER,
                      custnumber: result.rows[0].custnumber,
                      paidtype: (results.payment_method.type === "bank") ? "transfer" : "credit_card",
                      curr: result.rows[0].curr,
                      username: result.rows[0].username,
                      paid: 1,
                      payment: results.payment_method.name,
                      transtate: "ok" },
                    items: [] }
                  let total_amount = 0;
                  result.rows.forEach((item, index) => {
                    total_amount += item.amount;
                    results.data.items.push({
                      partnumber: item.partnumber,
                      description: item.description,
                      unit: item.unit,
                      qty: item.qty,
                      fxprice: item.fxprice,
                      discount: item.discount,
                      netamount: item.netamount,
                      taxcode: item.taxcode,
                      vatamount: item.vatamount,
                      amount: item.amount })}); }}
              callback(err); });
            break;
        
          default:
            callback(null);
            break; }}
      else {
        callback(null); }
    },

    function(callback) {
      if(results.valid && results.data.trans){
        results.ndi.datatype = "trans";
        ndi.updateData(nstore, results.ndi, [results.data.trans], function(err, result){
          if(!err){
            if(result.data.length > 0){
              results.data.items.forEach((item, index) => {
                item.transnumber = result.data[0];
                item.rownumber = index+1; });
              results.data.link = {
                nervatype1: "trans", refnumber1: result.data[0],
                nervatype2: "trans", refnumber2: params.ORDER_NUMBER} }}
          callback(err); });}
      else {
        callback(null); }
    },

    function(callback) {
      if(results.valid && results.data.items){
        results.ndi.datatype = "item";
        ndi.updateData(nstore, results.ndi, results.data.items, function(err, result){
          callback(err); });}
      else {
        callback(null); }
    },

    function(callback) {
      if(results.valid && results.data.link){
        results.ndi.datatype = "link";
        ndi.updateData(nstore, results.ndi, [results.data.link], function(err, result){
          callback(err); });}
      else {
        callback(null); }
    }
  ],
  function(err) {
    if(results.ndi){
      if(results.ndi.validator){
        if (results.ndi.validator.conn) {
          results.ndi.validator.conn.close(); results.ndi.validator.conn = null;}}}
    if(err){
      if(err.message){err = err.message;}}
    _callback(err, results);
  })
    
}

function index(params, req, res) {
  var sendResult = require('../../lib/ext/result.js').sendResult;
  var resMethod;
  
  async.waterfall([
    function(callback) {
      switch (params.method) {
        case "initDatabase":
          resMethod = init_database;
          break;
        case "getSettings":
          resMethod = get_settings;
          break;
        case "getDays":
          resMethod = get_days;
          break;
        case "getData":
          resMethod = get_data;
          break;
        case "setData":
          resMethod = set_data;
          break;
        case "getInvoice":
          resMethod = get_invoice;
          break;
        case "setOrder":
          resMethod = set_order;
          break;
        case "paymentResults":
          resMethod = payment_results;
          break;
        case "sendEmail":
          resMethod = send_email;
          break;
        default:
          resMethod = null; }
      if(!resMethod){
        callback(req.app.locals.lang.unknown_method, params.method); }
      else {
        callback(null); }
    },

    function(callback) {
      if(!params) {
        params = {} }
      else if(params.params) {
        params = params.params; }
      params.alias = params.alias || settings.PAYMENT.DATABASE;
      var nstore = require('nervatura').nervastore({ 
        conf: req.app.get("conf"), data_dir: req.app.get("data_dir"), report_dir: req.app.get("report_dir"),
        host_ip: req.ip, host_settings: req.app.get("host_settings"), storage: req.app.get("storage"),
        lang: req.app.locals.lang });
      getGoogleCerts(req.app, function(err, certs){
        callback(err, certs, nstore);
      });
    },

    function(certs, nstore, callback) {
      if(params.idToken) {
        var token = nstore.valid.decodeToken(params.idToken)
        nstore.local.setTokenSettings({
          key: certs[token.header.kid],
          options: { algorithms: [token.header.alg] } 
        });
        if(!params.custnumber){
          params.custnumber = token.payload.email || token.payload.phone_number }
        nstore.connect.getLogin({ database: params.alias, token: params.idToken },
          function(err, validator){
            params.validator = validator;
            if(err && ((resMethod === get_data) || (resMethod === set_data)) && 
              validator.token && !validator.customer && nstore.connect.getConnect()){
              params.validator.conn = nstore.connect.getConnect();
              err = null; }
            callback(err, nstore); });}
      else {
        nstore.local.setEngine({database:params.alias}, function(err, result){
          callback(err, nstore);});
      }
    },
    
    function(nstore, callback) {
      resMethod(nstore, params, function(err, results){
        callback(err, results);
      });
    }
  ],

  function(err, results) {
    if(err){
      if(err.message){err = err.message;}}
    if(!err){
      if(results.redirect){
        res.redirect(results.url); }
      else{
        sendResult(res, {type: "json", id: params.method, data: results}); }}
    else {
      sendResult(res, {type:"error", id: params.method || "error", ekey:null, err_msg: err, 
        data: {} }); }
  })
}

module.exports = router;