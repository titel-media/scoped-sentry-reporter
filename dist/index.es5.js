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

var DEFAULT_SENTRY_OPTIONS = {
  integrations: _browser.defaultIntegrations
};

var ReporterManager =
/*#__PURE__*/
function () {
  function ReporterManager() {
    _classCallCheck(this, ReporterManager);

    this.reporter = [];
    this.bindGlobalErrorHandlers();
  }

  _createClass(ReporterManager, [{
    key: "bindGlobalErrorHandlers",
    value: function bindGlobalErrorHandlers() {
      var _this = this;

      var saveOnErrorHandler = window.onerror;
      var saveOnUnhandledRejection = window.onunhandledrejection;

      window.onerror = function (a, b, c, d, e) {
        if (typeof saveOnErrorHandler === 'function') {
          saveOnErrorHandler(a, b, c, d, e);
        }

        _this.reportError(a, b, c, d, e);
      };

      window.onunhandledrejection = function (a, b, c, d, e) {
        if (typeof saveOnUnhandledRejection === 'function') {
          saveOnUnhandledRejection(a, b, c, d, e);
        }

        _this.reportError(a, b, c, d, e);
      };
    }
  }, {
    key: "isConditionMatched",
    value: function isConditionMatched(condition, _ref) {
      var conditions = _ref.conditions;
      return conditions.some();
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
      return this.reporter.filter(function (_ref2) {
        var conditions = _ref2.conditions;
        return conditions.some(function (condition) {
          return condition.test(url);
        });
      });
    }
  }, {
    key: "reportError",
    value: function reportError(msg, url, lineNumber, colNumber, originalError) {
      if (url) {
        var matchingReporter = this.getMatchingReporter(url);
        matchingReporter.forEach(function (_ref3) {
          var client = _ref3.client;
          client.captureException(originalError);
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('Error with message only occurred, skipping reporting');
      }
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
