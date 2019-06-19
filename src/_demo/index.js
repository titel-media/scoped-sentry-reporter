import App from './app';
import App1 from './_app1';
import App2 from './_app2';

(function() {
  const _app1 = new App1();
  const _app2 = new App2();
  const _app = new App();

  _app.initSentry('https://1337@sentry.io/1337');

  const buttonApp1 = document.getElementById('button-app-1');
  const buttonApp2 = document.getElementById('button-app-2');
  const buttonApp3 = document.getElementById('button-app-3');

  window.onload = () => {
    buttonApp1.addEventListener('click', () => {
      _app1.doError();
      // eslint-disable-next-line no-console
      console.warn(`should log to SENTRY_DSN1: ${SENTRY_DSN1}`);
    });
    buttonApp2.addEventListener('click', () => {
      _app2.doError();
      // eslint-disable-next-line no-console
      console.warn(`should log to SENTRY_DSN1: ${SENTRY_DSN2}`);
    });
    buttonApp3.addEventListener('click', () => {
      _app.doError();
      // eslint-disable-next-line no-console
      console.warn('should log to dummy dsn, but condition not met');
    });
  };
}());
