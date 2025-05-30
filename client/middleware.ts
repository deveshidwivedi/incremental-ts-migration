import {
  createListenerMiddleware,
  ListenerMiddlewareInstance
} from '@reduxjs/toolkit';

// Use generic types for TS+JS compatibility
const listenerMiddleware: ListenerMiddlewareInstance = createListenerMiddleware();

export default listenerMiddleware;
