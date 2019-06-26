import { Integrations } from '@sentry/browser';

class BrowserClient {
  constructor(options) {
    this.options = options;
  }

  captureException(err) {
    return err;
  }
}

module.exports = {
  BrowserClient,
  Integrations,
};
