/*eslint no-useless-escape: "off"*/

export const zeroPad = (x,y) => {
  y = Math.max(y-1,0);
  let n = (x / Math.pow(10,y)).toFixed(y);
  return n.replace('.',''); 
}

export const replaceAll = (text, sold, snew) => {
  text = text.replace(sold,snew);
  if (text.indexOf(sold)>-1) {return replaceAll(text, sold, snew);}
  else return text;}

export const getISODate = (cdate,nosep) => {
  if (typeof cdate === "undefined") {
    cdate = new Date();}
  if (nosep){
    return cdate.getFullYear()+zeroPad(cdate.getMonth()+1,2)+zeroPad(cdate.getDate(),2);}
  else {
    return cdate.getFullYear()+"-"+zeroPad(cdate.getMonth()+1,2)+"-"+zeroPad(cdate.getDate(),2);}
}

export const getISODateTime = (cdate,full,nosep) => {
  if (typeof cdate === "undefined") {
    cdate = new Date();}
  if (typeof full === "undefined") {
    full = true;}
  if (full) {
    if (nosep){
      return getISODate(cdate,nosep)+zeroPad(cdate.getHours(),2)+
        zeroPad(cdate.getMinutes(),2)+zeroPad(cdate.getSeconds(),2);}
    else {
      return getISODate(cdate)+" "+zeroPad(cdate.getHours(),2)+":"+
        zeroPad(cdate.getMinutes(),2)+":"+zeroPad(cdate.getSeconds(),2);}}
  else {
    return getISODate(cdate)+" 00:00:00";}
}

export const convertDate = (year,mo,day) => {
  return getISODate(new Date(year,mo-1,day));
}

export const convertDateTime = (year,mo,day,ho,min) => {
  return getISODateTime(new Date(year,mo-1,day,ho,min,0));
}

export const getValidDate = (value) => {
  let year,mo,day;
  value = replaceAll(value,"'","");
  if (value!=="" && value!==null){
    if (value.length>=4) {
      year = parseInt(value.substring(0,4),10);
      if (isNaN(year)) {year = new Date().getFullYear();}
      if (year<1900) {year = 1900;}
      if (year>2200) {year = 2200;}}
    else {
      year = new Date().getFullYear();}
    if (value.length>=7) {
      mo = parseInt(value.substring(5,7),10);
      if (isNaN(mo)) {mo = 1;}
      if (mo<1) {mo = 1;}
      if (mo>12) {mo = 12;}}
    else {mo = 1;}
    if (value.length>=10) {
      day = parseInt(value.substring(8,10),10);
      if (isNaN(day)) {day = 1;}}
    else {day = 1;}
    return getISODate(new Date(year,mo-1,day));}
  else {
    return value;}}

export const groupSeparator = (nStr, sep) => {
  if (typeof sep === "undefined") {
    sep = " ";}
  nStr += ''; let x = nStr.split('.');
  let x1 = x[0]; let x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + sep + '$2');}
  return x1 + x2;}
  
export const round = (n,dec) => {
  n = parseFloat(n);
  if(!isNaN(n)){
    if(!dec) dec= 0;
    let factor= Math.pow(10,dec);
    return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
  }else{
    return n;}
}

export const onNumberInput = (options, value) => {
  switch (options.fieldtype) {
    case "integer":
      let ivalue = parseInt(value.replace(/[^0-9\-]|\-(?=.)/g,''),10);
      if (isNaN(ivalue)){ivalue = 0;}
      if (value !== ivalue) {value = ivalue;}
      if (value==="" || isNaN(value) || value===null) {value = "0";}
      break;
    case "float":
      //value = value.replace(/[^0-9\-\.,]|[\-](?=.)|[\.,](?=[0-9]*[\.,])/g,'');
      let fvalue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      if (isNaN(fvalue)){fvalue = 0;}
      if (value !== fvalue && value !== fvalue+".") {value = fvalue;}
      if (value==="" || isNaN(value) || value===null) {value = "0";}
      break;
    case "percent":
      value=value.replace(/[^0-9\-\.,%]|[\-](?=.)|[\.,%](?=[0-9]*[\.,%])/g,'');
      if (value==="" || isNaN(value) || value===null) {value = "0";}
      if (value.indexOf("%")>-1) {
        let pv = parseInt(value.replace("%",""),10);
        if (pv>100) {pv=100;}
        value = pv.toString()+"%";}
      break;
    case "bool":
      value = parseInt(value.replace(/[^0-1]|\-(?=.)/g,''),10);
      if (value==="" || isNaN(value) || value===null) {value = "0";}
      if (parseInt(value,10)>1) {value=0;}
      value= parseInt(value,10).toString();
      break;
    default:
      break;}
  if (typeof options.min !== "undefined") {
    if (parseInt(value,10) < options.min) {
      value = options.min;}}
  if (typeof options.max !== "undefined") {
    if (parseInt(value,10) > options.max) {
      value = options.max;}}
  return value;}
  
  export const onValueChange = (options, value) => {
    var year,mo,day,ho,min;
    switch (options.fieldtype) {
      case "integer":
        value = parseInt(value,10);
        break;
      case "float":
        value = parseFloat(value);
        break;
      case "date":
        if (value === "" && (options.empty === "false")) {
          value = getISODate();}
        else {
          if (value !== "") {
            if (value.length >= 4) {
              year = parseInt(value.substring(0,4),10);
              if (isNaN(year)) {year = new Date().getFullYear();}
              if (year<1900) {year = 1900;}
              if (year>2200) {year = 2200;}}
            else {
              year = new Date().getFullYear();}
            if (value.length>=7) {
              mo = parseInt(value.substring(5,7),10);
              if (isNaN(mo)) {mo = 1;}
              if (mo<1) {mo = 1;}
              if (mo>12) {mo = 12;}}
            else {mo = 1;}
            if (value.length>=10) {
              day = parseInt(value.substring(8,10),10);
              if (isNaN(day)) {day = 1;}}
            else {day = 1;}
            value = convertDate(year,mo,day);}}
        break;
      case "time":
        if (value==="") {
          if(options.empty === "false"){
            value = "00:00"; }
          else { value = ""; }}
        else {
          var tdate = [];
          if (value.indexOf(":")>-1){
            tdate = value.split(":");}
          else {tdate = [value, 0];}
          if (isNaN(parseInt(tdate[0],10)) || parseInt(tdate[0],10)<0 || parseInt(tdate[0],10)>23){
            tdate[0] = 0;}
          if (tdate.length >= 2) {
            if (isNaN(parseInt(tdate[1],10)) || parseInt(tdate[1],10)<0 || parseInt(tdate[1],10)>59){
              tdate[1] = 0; }}
          else {
            tdate[1] = 0;}
          value = zeroPad(parseInt(tdate[0],10),2)+":"+zeroPad(parseInt(tdate[1],10),2); }
        break;
      case "datetime":
        if (value==="" && (options.empty === "false")) {
          value = getISODateTime(new Date(),false);}
        else {
          if (value!=="") {
            if (value.length>=4) {
              year = parseInt(value.substring(0,4),10);
              if (isNaN(year)) {year = new Date().getFullYear();}
              if (year<1900) {year = 1900;}
              if (year>2200) {year = 2200;}}
            else {
              year = new Date().getFullYear();}
            if (value.length>=7) {
              mo = parseInt(value.substring(5,7),10);
              if (isNaN(mo)) {mo = 1;}
              if (mo<1) {mo = 1;}
              if (mo>12) {mo = 12;}}
            else {mo = 1;}
            if (value.length>=10) {
              day = parseInt(value.substring(8,10),10);
              if (isNaN(day)) {day = 1;}}
            else {day = 1;}
            if (value.length>=13) {
              ho = parseInt(value.substring(11,13),10);
              if (isNaN(ho)) {ho = 0;}}
            else {ho = 0;}
            if (value.length>=16) {
              min = parseInt(value.substring(14,16),10);
              if (isNaN(min)) {min = 0;}}
            else {min = 0;}
            value = convertDateTime(year,mo,day,ho,min);}}
        break;
      default:
        break;}
    return value;}