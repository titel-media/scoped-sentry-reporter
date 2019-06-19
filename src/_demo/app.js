import ReporterManager from '../reporterManager';

class App {
  initSentry(...params) {
    ReporterManager.initSentry(...params);
  }

  doError() {
    throw new Error('generalApp');
  }
}

export default App;
