import { createStore, applyMiddleware, compose} from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import {persistStore,persistReducer} from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import rootReducer from '../src/modules'
import createEncryptor from 'redux-persist-transform-encrypt'
import { loadUser } from "redux-oidc";
import userManager from "../src/utilities/userManager";

export const history = createHistory()


const enhancers = []
const middleware = [thunk, routerMiddleware(history)]

if (process.env.NODE_ENV === 'development') {
  //console.log(process.env);
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}


const encryptor = createEncryptor({
  secretKey: 'secretKey',
  onError(error) {
    console.log('Encryptor error', error);
    // Handle the error.
  },
});

  const persistConfigEnc = {
    key: 'root',
    storage:storageSession,
    transforms:[encryptor],
   // blacklist: ['counter','reload']
    }

  const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
  )

  const persistedReducer = persistReducer(persistConfigEnc, rootReducer)

  export const store = createStore(connectRouter(history)(persistedReducer),undefined,composedEnhancers);

  loadUser(store, userManager);

  export const persistor = persistStore(store)

  













