"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _browser = require("@sentry/browser");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var URL_MATCHER = /https?:\/\/.*\/\w+\.\w{2,4}/gmi;
var DEFAULT_SENTRY_OPTIONS = {
  integrations: _browser.defaultIntegrations
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
    this.bindGlobalErrorHandlers();
  }

  _createClass(ReporterManager, [{
    key: "bindGlobalErrorHandlers",
    value: function bindGlobalErrorHandlers() {
      var _this = this;

      var saveOnErrorHandler = window.onerror;
      var saveOnUnhandledRejection = window.onunhandledrejection;

      window.onerror = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (_this.debugMode) {
          var _console;

          // eslint-disable-next-line no-console
          (_console = console).info.apply(_console, ['onerror'].concat(args));
        }

        if (typeof saveOnErrorHandler === 'function') {
          saveOnErrorHandler.apply(void 0, args);
        }

        _this.reportError.apply(_this, args);
      };

      window.onunhandledrejection = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (_this.debugMode) {
          var _console2;

          // eslint-disable-next-line no-console
          (_console2 = console).info.apply(_console2, ['onunhandledrejection'].concat(args));
        }

        if (typeof saveOnUnhandledRejection === 'function') {
          saveOnUnhandledRejection.apply(void 0, args);
        }

        _this.reportError.apply(_this, args);
      };
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
    value: function reportToClients(clients, err) {
      var _this2 = this;

      clients.forEach(function (_ref2) {
        var client = _ref2.client;

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
    value: function reportError(msg, url, lineNumber, colNumber, originalError) {
      var _this3 = this;

      var reported = false;

      if (url) {
        var matches = this.getMatchingReporter(url);
        reported = this.reportToClients(matches, originalError);

        if (this.debugMode) {
          // eslint-disable-next-line no-console
          console.info('reported: ', reported, matches);
        }
      }

      if (!reported && originalError && originalError.stack) {
        var stacktraceUrls = originalError.stack.match(URL_MATCHER);

        if (this.debugMode) {
          // eslint-disable-next-line no-console
          console.info('stacktraceUrls: ', reported, stacktraceUrls);
        }

        stacktraceUrls.forEach(function (url) {
          if (!reported) {
            var _matches = _this3.getMatchingReporter(url);

            reported = _this3.reportToClients(_matches, originalError);
          }
        });
      }

      if (!reported) {
        // eslint-disable-next-line no-console
        console.warn('Error without url was thrown, skipping capture on Sentry.');
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
      this.addReporter(conditions, client);
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
