import ReporterManager from './reporterManager';

describe('ScopedSentryReporter: ReporterManager', () => {
  it('should add reporter', () => {
    expect(ReporterManager.getReporters()).toEqual([]);
  });

  it('should init sentry', () => {
    const dsn = 'fake-dsn';
    ReporterManager.initSentry(dsn);
    const reporters = ReporterManager.getReporters();
    expect(reporters).not.toHaveLength(0);
    const found = reporters.filter(r => r.hub.getClient().options.dsn);
    expect(found).not.toHaveLength(0);
    expect(found).toHaveLength(1);
  });
});
