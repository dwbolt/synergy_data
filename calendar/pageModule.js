import  {calendarClass  }   from '/_lib/UX/calendar_module.js'  ;

app.page = new calendarClass("weeks","app.page");
app.page.main(`/users/events/${app.page.year}/_graph.json` );