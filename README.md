# Scoped Sentry Reporter

## Why?
Sentry is supposed to be solely initialized on a project level. In most use cases this is sufficient.
Unfortunately, we needed a solution that can report errors from different sources (javascript files) to different Sentry DSN.

We embed scripts from other projects that can also run on their own directly in our main platform. In order to have their sourcemaps working we tried to implement a new way of dealing with those errors using Sentry.

## How

### Install 
```
  yarn add @titelmedia/scoped-sentry-reporter
  npm install @titelmedia/scoped-sentry-reporter --save
```

### Usage

```javascript
  import ReporterManager from '@titelmedia/scoped-sentry-reporter';
  // const ReporterManager = require('@titelmedia/scoped-sentry-reporter/src/index.es5.js').default;

  // instead of Sentry.init, you'd call
  ReporterManager.initSentry('YOUR_DSN@sentry.io/GOES_HERE', [/.*/], {
    /* REGULAR SENTRY OPTIONS */
  });
```

### Advanced Usage

The function initSentry is expecting an array of regular expressions as the second argument. With these you can define patterns so that stackTraces will be picked up and logged into the defined Sentry account.

```javascript
  ReporterManager.initSentry('YOUR_DSN@sentry.io/GOES_HERE', [/.*\/path\/to\/a\/file\.js/]);
```

The conditional logic is based upon Boolean or and it will log the error to this DSN if one of the urls in the stacktraces match one of those conditions.

```javascript
  ReporterManager.initSentry('YOUR_DSN@sentry.io/GOES_HERE', [
    /.*\/a\.js/,
    /.*\/b\.js/,
    /.*\/c\.js/
  ]);
```

Use a default reporter when nothing matches your conditions.

```javascript
  // Let's say that you get an error d.js that will not be logged, because conditions do not match.
  ReporterManager.initSentry('YOUR_DSN@sentry.io/GOES_HERE', [/.*\/(a|b|c)\.js/]);

  // after setting a default reporter all errors that cannot be reported to any instance
  // will end up in this project.
  ReporterManager.setDefaultReporter('YOUR_DSN@sentry.io/GOES_HERE', {
    /* REGULAR SENTRY OPTIONS */
  });
```

### Infos and Culprits

One big culprit could be that you'd expect the manager to report one error to all instances. This is not intended to work. The error should be logged into the Sentry instance that is closer to the thrown error location - this saves some duplicates on different Sentry projects.

Does only work in browsers.
