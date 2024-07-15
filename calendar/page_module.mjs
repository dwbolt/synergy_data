import  {calendar_class}    from '/_lib/web_componets/calendar-sfc/_.mjs';  // support <calendar-sfc> web componet

      app.page = document.getElementById("calendar");
      app.page.calendar_add("users/databases/synergy/calendar");   // get users personal calendar, must be logged in
await app.page.init();                                             // load calenders and create html place holders
await app.page.main();                                             // display calender or event page
//app.page.tableUx.changePageSize({value: 5});

