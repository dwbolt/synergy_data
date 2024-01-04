import  {calendarClass  }   from '/_lib/UX/calendar_module.js';
app.page = new calendarClass("weeks","app.page");
await app.page.main(new Date().getFullYear()); 