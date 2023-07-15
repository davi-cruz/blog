const React = require('react');
const ThemeProvider = require('./src/components/ContextProviders/ThemeProvider');
const GlobalStyle = require('./src/components/Layout/sharedStyles/globalStyles');

export const wrapPageElement = ({ element }) => (
  <>
    <GlobalStyle />
    <ThemeProvider>{element}</ThemeProvider>
  </>
);
