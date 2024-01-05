import  {calendarClass  }   from '/_lib/UX/calendar_module.js';

app.page = new calendarClass("weeks","app.page");
app.page.calender_add("users/databases/synergy/calendar");
await app.page.main(new Date().getFullYear()); 