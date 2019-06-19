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

    window.onerror = (...args) => {
      if (typeof saveOnErrorHandler === 'function') {
        saveOnErrorHandler(...args);
      }
      this.reportError(...args);
    };

    window.onunhandledrejection = (...args) => {
      if (typeof saveOnUnhandledRejection === 'function') {
        saveOnUnhandledRejection(...args);
      }
      this.reportError(...args);
    };
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
    } else {
      // eslint-disable-next-line no-console
      console.warn('Error without url was thrown, skipping capture on Sentry.');
    }
  }

  initSentry(dsn, conditions = [/.*/], additionalSentryOptions = {}) {
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

let _instance = null;

if (typeof window !== 'undefined') {
  _instance = !window.__SCOPED_SENTRY_REPORTER ? new ReporterManager() : window.__SCOPED_SENTRY_REPORTER;
  window.__SCOPED_SENTRY_REPORTER = _instance;
}

export default _instance;
