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
};
