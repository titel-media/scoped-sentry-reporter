class Hub {
  constructor(client) {
    this.client = client;
  }

  run(cb) {
    cb(this.client);
  }
}

module.exports = {
  Hub,
};
