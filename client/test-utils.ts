/**
 * This file re-exports @testing-library but ensures that
 * any calls to render have translations and theme available.
 *
 * This means tested components will be able to call
 * `t()` and have the translations of the default
 * language also components will be able to call
 * `prop()` and have the theming of the default theme.
 *
 * For i18n see: https://react.i18next.com/misc/testing#testing-without-stubbing
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Context as ResponsiveContext } from 'react-responsive';

import i18n from './i18n-test';
import ThemeProvider from './modules/App/components/ThemeProvider';
import configureStore from './store';
import theme, { Theme } from './theme';
import { Store } from 'redux';

export const history: MemoryHistory = createMemoryHistory();

// re-export everything
export * from '@testing-library/react';

type ResponsiveProviderProps = {
  children: ReactNode;
  mobile?: boolean;
  deviceWidth?: number;
};

const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
  mobile = false,
  deviceWidth
}) => {
  const width = deviceWidth ?? (mobile ? 400 : 1000);
  return (
    <ResponsiveContext.Provider value={{ width }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

ResponsiveProvider.propTypes = {
  children: PropTypes.element.isRequired,
  mobile: PropTypes.bool,
  deviceWidth: PropTypes.number
};

type ProvidersProps = ResponsiveProviderProps & {
  children: ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children, ...options }) => (
  <StyledThemeProvider theme={{ ...theme[Theme.light] }}>
    <I18nextProvider i18n={i18n}>
      <ResponsiveProvider {...options}>
        <Router history={history}>{children}</Router>
      </ResponsiveProvider>
    </I18nextProvider>
  </StyledThemeProvider>
);

Providers.propTypes = {
  children: PropTypes.element.isRequired
};

export type CustomRenderOptions = RenderOptions & {
  mobile?: boolean;
  deviceWidth?: number;
};

export type ReduxRenderOptions = CustomRenderOptions & {
  initialState?: any;
  store?: Store;
};

/**
 * @param ui React.ReactElement
 * @param options ReduxRenderOptions
 * @return RenderResult & { store: Store }
 */
function reduxRender(
  ui: ReactElement,
  { initialState, store = configureStore(initialState), ...renderOptions }: ReduxRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <ThemeProvider>
            <ResponsiveProvider {...renderOptions}>
              <Router history={history}>{children}</Router>
            </ResponsiveProvider>
          </ThemeProvider>
        </Provider>
      </I18nextProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.element.isRequired
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * @param ui React.ReactElement
 * @param options CustomRenderOptions
 * @return RenderResult
 */
const customRender = (ui: ReactElement, options?: CustomRenderOptions): RenderResult =>
  render(ui, {
    wrapper: (props) => <Providers {...props} {...options} />,
    ...options
  });

// override render method
export { customRender as render, reduxRender };
