import  {contactsModule}   from '/synergyData/contacts/contactsModule.js';


app.contacts = new contactsModule();

//get ride of footer
document.getElementById("footer"    ).innerHTML = "";