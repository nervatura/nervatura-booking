import moment from 'moment';
import { version } from '../../../package.json';

import locale_en from '../locales/en.json'
import _blank from '../img/blank.gif';

export const conf = {
  def: {
    locale: "en",
    locales: {
      en: locale_en 
    },
    datepicker: {
      dateFormat: "YYYY-MM-DD",
      timeFormat: "HH:mm"
    },
    api_path: "/api",
  },
  img: {
    flag_blank: _blank,
  },
  url: {
    routes_api: "https://github.com/nervatura/nervatura-booking/blob/master/routes/api.js",
    react_ui: "https://facebook.github.io/react/",
    firebase_auth: "https://firebase.google.com/products/auth/",
    web_token: "https://en.wikipedia.org/wiki/JSON_Web_Token",
    paytrail: "https://www.paytrail.com/en",
    github: "https://github.com/nervatura/nervatura-booking"
  },
  state: {
    version: version,
    lang: localStorage.getItem("lang") || "en",
    top_icon: false,
    menu: null,
    request_sending: false
  },
  modal: {
    type: ''
  },
  server: {
    settings: {},
    product: [],
    price: []
  },
  booking: {
    view: "search",
    login: {
      current: {},
      data: {},
      oitems: {}
    },
    search: {
      date_from: moment().format('YYYY-MM-DD'),
      date_to: moment().add(5, 'day').format('YYYY-MM-DD'),
      result: [],
      code: "",
      page: {
        search: 1,
        history: 1,
        order: 1,
        oitems: 1,
        invoices: 1,
        packages: 1
      }
    }
  }
}