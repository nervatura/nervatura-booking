Nervatura Booking
==================

Nervatura Sample Application

* Booking and event confirmation, invoicing
* Custom server side functions ([routes/api.js](https://github.com/nervatura/nervatura-booking/blob/master/routes/api.js))
* Custom static homepage ([React UI](https://facebook.github.io/react/))
* External user management ([Firebase Authentication](https://firebase.google.com/products/auth/) and [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token))
* Online payment service example ([Paytrail](https://www.paytrail.com/en))

## Installation & Quick Start

    $ git clone https://github.com/nervatura/nervatura-express.git nervatura
    $ cd nervatura
    $ npm install
    $ npm install --save moment moment-range
    $ rm -r www
    $ git clone https://github.com/nervatura/nervatura-booking.git www

Create a Firebase project in the [Firebase console](https://console.firebase.google.com/). Click Add Firebase to your web app. Copy and paste the config values to the [conf/settings.json](https://github.com/nervatura/nervatura-booking/blob/master/conf/settings.json) file (firebase field).

Before you can use Firebase to sign in users, you must enable and configure the sign-in methods you want to support. In the Firebase console, open the Authentication section and enable: email and password authentication, Google, Facebook and phone number sign-in.

Start the server and initialize the (demo) database:

```
  $ npm run dev
```
[http://localhost:8080/api?method=initDatabase&alias=demo](http://localhost:8080/api?method=initDatabase&alias=demo)

and [http://localhost:8080/](http://localhost:8080/)
