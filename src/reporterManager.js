import { defaultIntegrations, BrowserClient } from '@sentry/browser';

const DEFAULT_SENTRY_OPTIONS = {
  integrations: defaultIntegrations
};

class ReporterManager {
  constructor() {
    this.reporter = [];
    this.bindGlobalErrorHandlers();
  }

  bindGlobalErrorHandlers() {
    const saveOnErrorHandler = window.onerror;
    const saveOnUnhandledRejection = window.onunhandledrejection;

    window.onerror = (...all) => {
      if (typeof saveOnErrorHandler === 'function') {
        saveOnErrorHandler(...all);
      }
      this.reportError(...all);
    };

    window.onunhandledrejection = (...all) => {
      if (typeof saveOnUnhandledRejection === 'function') {
        saveOnUnhandledRejection(...all);
      }
      this.reportError(...all);
    };
  }

  isConditionMatched(condition, { conditions }) {
    return conditions.some();
  }

  addReporter(conditions, client) {
    this.reporter.push({ client, conditions });
  }

  removeReporter(client) {
    this.reporter = this.reporter.filter(reporter => reporter !== client);
  }

  getMatchingReporter(url) {
    return this.reporter.filter(({ conditions }) => conditions.some(condition => condition.test(url)));
  }

  reportError(msg, url, lineNumber, colNumber, originalError) {
    if (url) {
      const matchingReporter = this.getMatchingReporter(url);
      matchingReporter.forEach(({ client }) => {
        client.captureException(originalError);
      });
    }
  }

  initSentry(dsn, conditions = [], additionalSentryOptions = {}) {
    if (!dsn) {
      throw new Error('You need to provide a DSN');
    }
    if (!(conditions instanceof Array)) {
      throw new Error('You need to provide an array of conditions');
    }
    const options = {
      ...DEFAULT_SENTRY_OPTIONS,
      ...additionalSentryOptions,
      dsn,
    };
    const client = new BrowserClient(options);
    this.addReporter(conditions, client);
  }

  getReporters() {
    return this.reporter;
  }
}

const _instance = new ReporterManager();

export default _instance;
