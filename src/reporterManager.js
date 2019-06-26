import { Integrations as CoreIntegrations } from '@sentry/core';
import { BrowserClient } from '@sentry/browser';
import { Hub } from '@sentry/hub';
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
  constructor(debug = DEFAULT_OPTIONS.debug) {
    this.options = {
      ...DEFAULT_OPTIONS,
      debug,
    };
    this.reporter = [];
    this.defaultReporter = null;

    this.bindGlobalErrorHandlers();
  }

  set debugMode(on = DEFAULT_OPTIONS.debug) {
    this.options.debug = on;
  }

  get debugMode() {
    return this.options.debug;
  }

  bindGlobalErrorHandlers() {
    window.addEventListener('error', ({ error }) => this.reportError(error || {}));
    window.addEventListener('unhandledrejection', ({ error }) => this.reportError(error || {}));
  }

  addReporter(conditions, client) {
    this.reporter.push({ client, conditions });
  }

  setDefaultReporter(dsn, options = {}) {
    if (!dsn) {
      throw new Error('You need to provide a DSN');
    }

    const client = new BrowserClient({
      ...DEFAULT_SENTRY_OPTIONS,
      ...options,
      dsn,
    });

    this.defaultReporter = new Hub(client);
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

  reportError(error) {
    if (this.debugMode) {
      // eslint-disable-next-line no-console
      console.info('will report error: ', error);
    }
    let reported = false;
    const { stack } = error;
    if (stack) {
      const stacktraceUrls = error.stack.match(URL_MATCHER) || [];
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('stacktraceUrls: ', reported, stacktraceUrls);
      }
      stacktraceUrls.forEach(url => {
        if (!reported) {
          const matches = this.getMatchingReporter(url);
          reported = this.reportToClients(matches, error);
        }
      });
    }

    if (!reported && this.defaultReporter instanceof BrowserClient) {
      this.defaultReporter.captureException(error);
      reported = true;
    }

    if (!reported) {
      // eslint-disable-next-line no-console
      console.warn('Error thrown, skipping capture on Sentry.', error);
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
    const hub = new Hub(client);
    this.addReporter(conditions, hub);
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
