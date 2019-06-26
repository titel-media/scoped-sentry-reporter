"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.DEFAULT_OPTIONS = exports.DEFAULT_SENTRY_OPTIONS = exports.URL_MATCHER = void 0;

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
exports.URL_MATCHER = URL_MATCHER;
var DEFAULT_SENTRY_OPTIONS = {
  integrations: [new _core.Integrations.InboundFilters(), new _core.Integrations.FunctionToString(), new _integrations.TryCatch(), new _integrations.Breadcrumbs(), new _integrations.LinkedErrors(), new _integrations.UserAgent()]
};
exports.DEFAULT_SENTRY_OPTIONS = DEFAULT_SENTRY_OPTIONS;
var DEFAULT_OPTIONS = {
  debug: false
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

var ReporterManager =
/*#__PURE__*/
function () {
  function ReporterManager() {
    var debug = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_OPTIONS.debug;

    _classCallCheck(this, ReporterManager);

    this.initOnce({
      debug: debug
    });
  }

  _createClass(ReporterManager, [{
    key: "initOnce",
    value: function initOnce(options) {
      this.options = _objectSpread({}, DEFAULT_OPTIONS, options);
      this.reporter = [];
      this.defaultReporter = null;
      this.bindErrorHandler = this.bindErrorHandler.bind(this);
      this.bindGlobalErrorHandlers();
    }
  }, {
    key: "bindGlobalErrorHandlers",
    value: function bindGlobalErrorHandlers() {
      window.addEventListener('error', this.bindErrorHandler);
      window.addEventListener('unhandledrejection', this.bindErrorHandler);
    }
  }, {
    key: "bindErrorHandler",
    value: function bindErrorHandler(event) {
      if (this.debugMode) {
        // eslint-disable-next-line no-console
        console.info('handling event', event);
      }

      this.reportError(event && event.error || {});
    }
  }, {
    key: "addReporter",
    value: function addReporter(conditions, hub) {
      this.reporter.push({
        hub: hub,
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
      return this.reporter.filter(function (_ref) {
        var conditions = _ref.conditions;
        return conditions.some(function (condition) {
          return condition.test(url);
        });
      });
    }
  }, {
    key: "reportToClients",
    value: function reportToClients(hubs, err) {
      var _this = this;

      var reported = false;
      hubs.forEach(function (_ref2) {
        var hub = _ref2.hub;

        if (_this.debugMode) {
          // eslint-disable-next-line no-console
          console.info('reporting to: ', hub);
        }

        hub.run(function (client) {
          reported = Boolean(client.captureException(err));
        });
      });
      return reported;
    }
  }, {
    key: "reportError",
    value: function reportError(error) {
      var _this2 = this;

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
            var matches = _this2.getMatchingReporter(url);

            reported = _this2.reportToClients(matches, error);
          }
        });
      }

      if (!reported && this.defaultReporter instanceof _hub.Hub) {
        this.defaultReporter.run(function (client) {
          reported = Boolean(client.captureException(error));
        });
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
    set: function set(on) {
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
