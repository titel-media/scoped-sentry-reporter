import App from './app';

class App2 extends App {
  constructor() {
    super();
    this.initSentry(SENTRY_DSN2, [/.*\/_app2\.js.*/]);
  }

  doError() {
    app2NotDefinedModule(); // eslint-disable-line no-undef
  }
}

export default App2;
