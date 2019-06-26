import ReporterManager from './reporterManager';

let consoleInfo = {};
let consoleWarn = {};

const reset = () => {
  const reporters = ReporterManager.getReporters();
  reporters.forEach(reporter => {
    ReporterManager.removeReporter(reporter);
  });

  ReporterManager.defaultReporter = null;
};

describe('ScopedSentryReporter: ReporterManager', () => {
  /* eslint-disable no-console */
  beforeEach(() => {
    reset();
    consoleInfo = console.info;
    consoleWarn = console.warn;
    console.info = () => {};
    console.warn = () => {};
  });

  afterEach(() => {
    reset();
    console.info = consoleInfo;
    console.warn = consoleWarn;
  });
  /* eslint-enable no-console */

  it('should add reporter', () => {
    expect(ReporterManager.getReporters()).toEqual([]);
  });

  it('should init sentry', () => {
    const dsn = 'fake-dsn';
    ReporterManager.initSentry(dsn);
    const reporters = ReporterManager.getReporters();
    expect(reporters).not.toHaveLength(0);
    const found = reporters.filter(r => r.hub.client.options.dsn);
    expect(found).not.toHaveLength(0);
    expect(found).toHaveLength(1);
  });

  it('expect dsn to be set on init', () => {
    expect(() => {
      ReporterManager.initSentry(undefined);
    }).toThrow(/.*provide.*DSN.*/);
  });

  it('expect to have an array of conditions on init', () => {
    expect(() => {
      ReporterManager.initSentry('dsn', /.*/);
    }).toThrow(/.*provide.*array.*/);
  });

  it('should set default reporter', () => {
    const dsn = 'fallback-dsn';
    ReporterManager.setDefaultReporter(dsn);
    const defaultReporter = ReporterManager.defaultReporter.client.options.dsn;
    expect(defaultReporter).toEqual(dsn);
  });

  it('expect dsn to be set on setting default reporter', () => {
    expect(() => {
      ReporterManager.setDefaultReporter(undefined);
    }).toThrow(/.*provide.*DSN.*/);
  });

  it('should enable debug mode', () => {
    expect(ReporterManager.debugMode).toBeFalsy();
    ReporterManager.debugMode = true;
    expect(ReporterManager.debugMode).toBeTruthy();
    ReporterManager.debugMode = false;
    expect(ReporterManager.debugMode).toBeFalsy();
  });

  it('should use debug info', () => {
    const consoleSpyInfo = jest.fn();
    const consoleSpyWarn = jest.fn();
    console.info = consoleSpyInfo; // eslint-disable-line no-console
    console.warn = consoleSpyWarn; // eslint-disable-line no-console

    ReporterManager.debugMode = true;
    ReporterManager.bindErrorHandler();
    expect(consoleSpyInfo).toHaveBeenCalled();
    expect(consoleSpyWarn).toHaveBeenCalled();
  });

  it('should not use debug info', () => {
    const consoleSpyInfo = jest.fn();
    const consoleSpyWarn = jest.fn();
    console.info = consoleSpyInfo; // eslint-disable-line no-console
    console.warn = consoleSpyWarn; // eslint-disable-line no-console

    ReporterManager.debugMode = false;
    ReporterManager.bindErrorHandler();
    expect(consoleSpyInfo).not.toHaveBeenCalled();
    expect(consoleSpyWarn).toHaveBeenCalled();
  });

  it('should bind errorHandler', () => {
    const spy = jest.spyOn(ReporterManager, 'reportError');
    ReporterManager.bindErrorHandler(new ErrorEvent('foo'));

    expect(spy).toHaveBeenCalled();
  });

  it('should get all matching reporters', () => {
    const matches = ReporterManager.getMatchingReporter('https://foo.bar');
    expect(ReporterManager.getReporters()).toEqual(matches);

    ReporterManager.initSentry('123@sentry.io/123', [/foo\.bar/igm]);
    const matches2 = ReporterManager.getMatchingReporter('https://foo.bar');
    expect(ReporterManager.getReporters()).toEqual(matches2);

    ReporterManager.initSentry('123@sentry.io/123', [/foo\.barasd/igm]);
    const matches3 = ReporterManager.getMatchingReporter('https://foo.bar');
    expect(ReporterManager.getReporters()).not.toEqual(matches3);

    const reporters = ReporterManager.getReporters();
    expect(reporters).toHaveLength(2);
  });

  it('should remove reporter', () => {
    expect(ReporterManager.getReporters()).toHaveLength(0);

    ReporterManager.initSentry('123@sentry.io/123', [/foo\.barasd/igm]);
    ReporterManager.initSentry('123@sentry.io/123', [/.*/igm]);
    expect(ReporterManager.getReporters()).toHaveLength(2);

    ReporterManager.getReporters().forEach(reporter => {
      ReporterManager.removeReporter(reporter);
    });

    expect(ReporterManager.getReporters()).toHaveLength(0);
  });

  it('should report to clients', () => {
    ReporterManager.initSentry('123@sentry.io/123');
    const clients = ReporterManager.getReporters();
    const r = ReporterManager.reportToClients(clients, new Error('foo-test'));
    expect(r).toBeTruthy();
  });

  it('should report to clients in debug mode', () => {
    ReporterManager.debugMode = true;
    const spy = jest.fn();
    console.info = spy; // eslint-disable-line no-console
    ReporterManager.initSentry('123@sentry.io/123');
    const clients = ReporterManager.getReporters();
    const r = ReporterManager.reportToClients(clients, new Error('foo-test'));
    expect(r).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should report an error in debug mode', () => {
    ReporterManager.debugMode = true;

    ReporterManager.initSentry('123@sentry.io/123');
    ReporterManager.initSentry('345@sentry.io/345', [/.*help\.html/]);

    const mock = jest.fn(() => false);
    const mockStored = ReporterManager.reportToClients;
    ReporterManager.reportToClients = mock;

    const r = ReporterManager.reportError({ stack: 'https://url.de/foo.js:28:123\nhttp://bar.de/help.html:234:23' });

    ReporterManager.reportToClients = mockStored;

    expect(r).toBeFalsy();
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('should report an error not in debug mode', () => {
    ReporterManager.debugMode = false;

    ReporterManager.initSentry('123@sentry.io/123');
    ReporterManager.initSentry('345@sentry.io/345', [/.*help\.html/]);

    const mock = jest.fn(() => true);
    const mockStored = ReporterManager.reportToClients;
    ReporterManager.reportToClients = mock;

    const r = ReporterManager.reportError({ stack: 'https://url.de/foo.js:28:123\nhttp://bar.de/help.html:234:23' });

    ReporterManager.reportToClients = mockStored;

    expect(r).toBeTruthy();
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should to default reporter', () => {
    ReporterManager.debugMode = false;

    ReporterManager.setDefaultReporter('555@sentry.io/555', [/a\.js/]);

    const mock = jest.fn(() => false);
    const mockStored = ReporterManager.reportToClients;
    ReporterManager.reportToClients = mock;

    ReporterManager.reportError({ stack: 'b.js' });

    ReporterManager.reportToClients = mockStored;

    expect(mock).toHaveBeenCalledTimes(0);
  });
});
