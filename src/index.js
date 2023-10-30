import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom'
import './index.css';
import App from './components/app/app.component.js';
 import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import {PersistGate} from 'redux-persist/integration/react'

import {store,persistor,history} from './store'
import userManager from '../src/utilities/userManager';
import { OidcProvider } from 'redux-oidc';
import * as Oidc from 'oidc-client' 

/*  if(process.env.NODE_ENV=== 'development') {
 Oidc.Log.logger = console;
 Oidc.Log.level = Oidc.Log.DEBUG;
} 
 */


    const rootElement = document.getElementById('root');


render(
  <Provider store={store}>
  <OidcProvider store={store} userManager={userManager}>
<PersistGate persistor={persistor} loading={null}>
  <ConnectedRouter history={history}>
<App/>
</ConnectedRouter>
    </PersistGate>
    </OidcProvider>
  </Provider>, rootElement
)



