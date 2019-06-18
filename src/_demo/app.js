import ReporterManager from '../reporterManager';

class App {
  constructor() {
    this._reporterManager = new ReporterManager();
  }

  initSentry(...params) {
    this._reporterManager.initSentry(...params);
  }

  doError() {
    throw new Error('foo');
  }
}

export default App;
