import App from './app';

class App1 extends App {
  constructor() {
    super();
    this.initSentry(SENTRY_DSN1, [/.*\/_app1\.js.*/]);
  }

  doError() {
    app1NotDefinedModule(); // eslint-disable-line no-undef
  }
}

export default App1;
