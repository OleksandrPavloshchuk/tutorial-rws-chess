import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import UUID from 'uuid-js';

import reducer from './services/reducer';
import socketProvider from './services/socketProvider';

import './assets/css/index.css';
import App from './ui/App';
import * as serviceWorker from './serviceWorker';

const store = createStore(reducer);
const player = UUID.create().toString();
socketProvider(store.dispatch, player);

const ConnectedApp = connect(state => state)(App);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp/>
    </Provider>
  , document.getElementById('root'));

serviceWorker.unregister();
