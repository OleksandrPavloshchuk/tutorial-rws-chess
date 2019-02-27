import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';

import reducer from './services/reducer';

import './assets/css/index.css';
import App from './ui/App';
import * as serviceWorker from './serviceWorker';

const store = createStore(reducer);

const ConnectedApp = connect(state => state)(App);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp/>
    </Provider>
  , document.getElementById('root'));

serviceWorker.unregister();
