"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _core = require("@sentry/core");

var _browser = require("@sentry/browser");

var _hub = require("@sentry/hub");

var _integrations = require("@sentry/browser/dist/integrations");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var URL_MATCHER = /https?:\/\/.*\/\w+\.\w{2,4}/gmi;
var DEFAULT_SENTRY_OPTIONS = {
  integrations: [new _core.Integrations.InboundFilters(), new _core.Integrations.FunctionToString(), new _integrations.TryCatch(), new _integrations.Breadcrumbs(), new _integrations.LinkedErrors(), new _integrations.UserAgent()]
};
var DEFAULT_OPTIONS = {
  debug: false
};

var ReporterManager =
/*#__PURE__*/
function () {
  function ReporterManager() {
    var debug = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_OPTIONS.debug;

    _classCallCheck(this, ReporterManager);

    this.options = _objectSpread({}, DEFAULT_OPTIONS, {
      debug: debug
    });
    this.reporter = [];
    this.defaultReporter = null;
    this.bindGlobalErrorHandlers();
  }

  _createClass(ReporterManager, [{
    key: "bindGlobalErrorHandlers",
    value: function bindGlobalErrorHandlers() {
      var _this = this;

      window.addEventListener('error', function (_ref) {
        var error = _ref.error;
        return _this.reportError(error);
      });
      window.addEventListener('unhandledrejection', function (_ref2) {
        var error = _ref2.error;
        return _this.reportError(error);
      });
    }
  }, {
    key: "addReporter",
    value: function addReporter(conditions, client) {
      this.reporter.push({
        client: client,
        conditions: conditions
      });
    }
  }, {
    key: "setDefaultReporter",
    value: function setDefaultReporter(dsn) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!dsn) {
        throw new Error('You need to provide a DSN');
      }

      var client = new _browser.BrowserClient(_objectSpread({}, DEFAULT_SENTRY_OPTIONS, options, {
        dsn: dsn
      }));
      this.defaultReporter = new _hub.Hub(client);
    }
  }, {
    key: "removeReporter",
    value: function removeReporter(client) {
      this.reporter = this.reporter.filter(function (reporter) {
        return reporter !== client;
      });
    }
  }, {
    key: "getMatchingReporter",
    value: function getMatchingReporter(url) {
      return this.reporter.filter(function (_ref3) {
        var conditions = _ref3.conditions;
        return conditions.some(function (condition) {
          return condition.test(url);
        });
      });
    }
  }, {
    key: "reportToClients",
    value: function reportToClients(clients, err) {
      var _this2 = this;

      clients.forEach(function (_ref4) {
        var client = _ref4.client;

        if (_this2.debugMode) {
          // eslint-disable-next-line no-console
          console.info('reporting to: ', client);
        }

        client.captureException(err);
      });
      return clients && clients.length > 0;
    }
  }, {
    key: "reportError",
    value: function reportError() {
      var _this3 = this;

      var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('will report error: ', error);
      }

      var reported = false;
      var stack = error.stack;

      if (stack) {
        var stacktraceUrls = error.stack.match(URL_MATCHER) || [];

        if (this.debugMode) {
          // eslint-disable-next-line no-console
          console.info('stacktraceUrls: ', reported, stacktraceUrls);
        }

        stacktraceUrls.forEach(function (url) {
          if (!reported) {
            var matches = _this3.getMatchingReporter(url);

            reported = _this3.reportToClients(matches, error);
          }
        });
      }

      if (!reported && this.defaultReporter instanceof _browser.BrowserClient) {
        this.defaultReporter.captureException(error);
        reported = true;
      }

      if (!reported) {
        // eslint-disable-next-line no-console
        console.warn('Error thrown, skipping capture on Sentry.', error);
      }

      return reported;
    }
  }, {
    key: "initSentry",
    value: function initSentry(dsn) {
      var conditions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [/.*/];
      var additionalSentryOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!dsn) {
        throw new Error('You need to provide a DSN');
      }

      if (!(conditions instanceof Array)) {
        throw new Error('You need to provide an array of conditions');
      }

      var options = _objectSpread({}, DEFAULT_SENTRY_OPTIONS, additionalSentryOptions, {
        dsn: dsn
      });

      var client = new _browser.BrowserClient(options);
      var hub = new _hub.Hub(client);
      this.addReporter(conditions, hub);
    }
  }, {
    key: "getReporters",
    value: function getReporters() {
      return this.reporter;
    }
  }, {
    key: "debugMode",
    set: function set() {
      var on = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_OPTIONS.debug;
      this.options.debug = on;
    },
    get: function get() {
      return this.options.debug;
    }
  }]);

  return ReporterManager;
}();

var _instance = null;

if (typeof window !== 'undefined') {
  _instance = !window.__SCOPED_SENTRY_REPORTER ? new ReporterManager() : window.__SCOPED_SENTRY_REPORTER;
  window.__SCOPED_SENTRY_REPORTER = _instance;
}

var _default = _instance;
exports["default"] = _default;
