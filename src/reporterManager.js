import { Integrations as CoreIntegrations } from '@sentry/core';
import { BrowserClient, Integrations as BrowserIntegrations } from '@sentry/browser';
import { Hub } from '@sentry/hub';

export const URL_MATCHER = /https?:\/\/.*\/\w+\.\w{2,4}/gmi;

export const DEFAULT_SENTRY_OPTIONS = {
  integrations: [
    new CoreIntegrations.InboundFilters(),
    new CoreIntegrations.FunctionToString(),
    new BrowserIntegrations.TryCatch(),
    new BrowserIntegrations.Breadcrumbs(),
    new BrowserIntegrations.LinkedErrors(),
    new BrowserIntegrations.UserAgent(),
  ],
};

export const DEFAULT_OPTIONS = {
  debug: false,
};

class ReporterManager {
  constructor(debug = DEFAULT_OPTIONS.debug) {
    this.initOnce({ debug });
  }

  initOnce(options) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.reporter = [];
    this.defaultReporter = null;

    this.bindErrorHandler = this.bindErrorHandler.bind(this);

    this.bindGlobalErrorHandlers();
  }

  set debugMode(on) {
    this.options.debug = on;
  }

  get debugMode() {
    return this.options.debug;
  }

  bindGlobalErrorHandlers() {
    window.addEventListener('error', this.bindErrorHandler);
    window.addEventListener('unhandledrejection', this.bindErrorHandler);
  }

  bindErrorHandler(event) {
    if (this.debugMode) {
      // eslint-disable-next-line no-console
      console.info('handling event', event);
    }
    this.reportError((event && event.error) || {});
  }

  addReporter(conditions, hub) {
    this.reporter.push({ hub, conditions });
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

  reportToClients(hubs, err) {
    let reported = false;
    hubs.forEach(({ hub }) => {
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('reporting to: ', hub);
      }
      hub.run(client => {
        reported = Boolean(client.captureException(err));
      });
    });
    return reported;
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

    if (!reported && this.defaultReporter instanceof Hub) {
      this.defaultReporter.run(client => {
        reported = Boolean(client.captureException(error));
      });
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
