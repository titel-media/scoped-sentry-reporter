import ReporterManager from './reporterManager';

const _reporterManager = new ReporterManager();

describe('ScopedSentryReporter: ReporterManager', () => {
  it('should create a singleton instance', () => {
    const reporter1 = new ReporterManager();
    const reporter2 = new ReporterManager();
    expect(reporter1).toEqual(reporter2);
    expect(reporter1).toEqual(_reporterManager);
    expect(reporter2).toEqual(_reporterManager);
  });

  it('should add reporter', () => {
    expect(_reporterManager.getReporters()).toEqual([]);
  });

  it('should init sentry', () => {
    const dsn = 'fake-dsn';
    _reporterManager.initSentry(dsn);
    const reporters = _reporterManager.getReporters();
    expect(reporters).not.toHaveLength(0);
    const found = reporters.filter(r => r.client.options.dsn);
    expect(found).not.toHaveLength(0);
    expect(found).toHaveLength(1);
  });
});
