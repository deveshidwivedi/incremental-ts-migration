import {
  configureStore,
  PreloadedState,
  EnhancedStore
} from '@reduxjs/toolkit';
import listenerMiddleware from './middleware';
import DevTools from './modules/App/components/DevTools';
import rootReducer, { RootState } from './reducers';
import { clearState, loadState } from './persistState';
import getConfig from './utils/getConfig';

// Extend the Window type for Redux DevTools extension
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: unknown;
  }
}

// Enable DevTools only when rendering on client and during development.
// Display the dock monitor only if no browser extension is found.
export function showReduxDevTools(): boolean {
  return (
    Boolean(getConfig('CLIENT')) &&
    getConfig('NODE_ENV') === 'development' &&
    !window.__REDUX_DEVTOOLS_EXTENSION__
  );
}

// generic type for initialState for TS+JS compatibility
export default function setupStore(
  initialState?: PreloadedState<RootState>
): EnhancedStore<RootState> {
  const savedState = loadState();
  clearState();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        serializableCheck: false,
        // TODO: enable immutableCheck once the mutations are fixed.
        immutableCheck: false
      }).concat(listenerMiddleware.middleware),
    preloadedState: savedState || initialState,
    enhancers: showReduxDevTools() ? [DevTools.instrument()] : []
  });

  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('./reducers', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nextRootReducer = require('./reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
