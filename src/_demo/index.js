import App1 from './_app1';
import App2 from './_app2';

(function() {
  const _app1 = new App1(); // eslint-disable-line no-unused-vars
  const _app2 = new App2(); // eslint-disable-line no-unused-vars

  // _app1.doError();

  _app2.doError();

}());
