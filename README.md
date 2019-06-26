# Scoped Sentry Reporter

## Why?
In most cases, it is sufficient to initialize Sentry on a project level.
Unfortunately, we needed a solution in which errors from different sources (javascript files) can be reported to different Sentry DSNs. We embed scripts from other projects that can also run on their own, directly into our main platform. 

This repo deals with abovementioned errors and makes sure sourcemaps are working.

## How?

### Install 
```
  yarn add @titelmedia/scoped-sentry-reporter --dev
  npm install @titelmedia/scoped-sentry-reporter --save-dev
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

The function `initSentry` expects an array of regular expressions as the second argument. With these, you can define patterns so that `stackTraces` will be picked up and logged into the defined Sentry account.

```javascript
  ReporterManager.initSentry('YOUR_DSN@sentry.io/GOES_HERE', [/.*\/path\/to\/a\/file\.js/]);
```

The conditional logic is based on Booleans and will log the error to the respective DSN if one of the urls in the `stackTraces` match one of the conditions.

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

  // After setting a default reporter all errors that cannot be reported to any instance
  // will end up in this project.
  ReporterManager.setDefaultReporter('YOUR_DSN@sentry.io/GOES_HERE', {
    /* REGULAR SENTRY OPTIONS */
  });
```

### Infos and Culprits

One big culprit could be that you'd expect the manager to report one error to all instances. This is not intended to work. The error should be logged into the Sentry instance that is closer to the thrown error location - this saves some duplicates on different Sentry projects.

Aditionally, the reporter only works in browsers.
