
class homeClass {
/*

file: 2-web/apps/accounting/1-pages/home.js

Allows user to login

*/


// homeClass - client side
constructor() {
}


// homeClass - client side
// code depends on None being the first option
async main() {
  // build login form
  app.login.buildForm(`login`);

  // reload menu on lognin
  app.login.loginTrue = app.menu.bind(app);
}

// homeClass - client side
}  /////////////// end

export {homeClass}
