import { Integrations as CoreIntegrations } from '@sentry/core';
import { BrowserClient } from '@sentry/browser';
import { Breadcrumbs, LinkedErrors, TryCatch, UserAgent } from '@sentry/browser/dist/integrations';

const URL_MATCHER = /https?:\/\/.*\/\w+\.\w{2,4}/gmi;

const DEFAULT_SENTRY_OPTIONS = {
  integrations: [
    new CoreIntegrations.InboundFilters(),
    new CoreIntegrations.FunctionToString(),
    new TryCatch(),
    new Breadcrumbs(),
    new LinkedErrors(),
    new UserAgent(),
  ],
};

const DEFAULT_OPTIONS = {
  debug: false,
};

class ReporterManager {
  constructor(debug = DEFAULT_OPTIONS.debug,) {
    this.options = {
      ...DEFAULT_OPTIONS,
      debug,
    };
    this.reporter = [];

    this.reportError = this.reportError.bind(this);

    this.bindGlobalErrorHandlers();
  }

  set debugMode(on = DEFAULT_OPTIONS.debug) {
    this.options.debug = on;
  }

  get debugMode() {
    return this.options.debug;
  }

  bindGlobalErrorHandlers() {
    window.addEventListener('error', this.reportError);
    window.addEventListener('unhandledrejection', this.reportError);
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

  reportToClients(clients, err) {
    clients.forEach(({ client }) => {
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('reporting to: ', client);
      }
      client.captureException(err);
    });
    return clients && clients.length > 0;
  }

  reportError(msg, url, lineNumber, colNumber, originalError) {
    if (this.debugMode) {
      // eslint-disable-next-line no-console
      console.info('will report error: ', msg, url, lineNumber, colNumber, originalError);
    }
    let reported = false;
    if (url) {
      const matches = this.getMatchingReporter(url);
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('found matches: ', matches);
      }
      reported = this.reportToClients(matches, originalError);
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('reported: ', reported, matches);
      }
    }
    if (!reported && originalError && originalError.stack) {
      const stacktraceUrls = originalError.stack.match(URL_MATCHER) || [];
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('stacktraceUrls: ', reported, stacktraceUrls);
      }
      stacktraceUrls.forEach(url => {
        if (!reported) {
          const matches = this.getMatchingReporter(url);
          reported = this.reportToClients(matches, originalError);
        }
      });
    }

    if (!reported) {
      // eslint-disable-next-line no-console
      console.warn('Error without url was thrown, skipping capture on Sentry.');
    }
    return reported;
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
