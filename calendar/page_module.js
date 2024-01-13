import  {calendarClass  }   from '/_lib/UX/calendar_module.js';

      app.page = new calendarClass("weeks","app.page");
      app.page.calender_add("users/databases/synergy/calendar");  
await app.page.init();                                             // load calenders and create html place holders
await app.page.main();                                             // display calender or event page