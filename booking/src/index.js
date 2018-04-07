import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { store } from './store'
import AppPage from './components/AppPage';

ReactDOM.render(
  <Provider store={store}>
    <AppPage />
  </Provider>,
  document.getElementById('root')
);
