import { dbClass     } from '/_lib/db/dbModule.js'      ;
import { tableClass  } from '/_lib/db/tableModule.js'   ;
import { csvClass    } from '/_lib/db/csvModule.js'     ;

import { tableUxClass} from '/_lib/UX/tableUxModule.js' ;
import { proxyClass  } from '/_lib/proxy/proxyModule.js';

class databaseClass { 

constructor( // client side databaseClass
    dir    // user directory that database is in
   ,DOMid  // 
){  
    this.url  = "/users/database/_db.json";    // hardcode database for now
    this.dir     = dir  ;   // directory in user space that po
    this.DOMid   = DOMid;   // where on the page the database interacts with the use

    app.database  = this;   // get access to instance by app.contacts;

    this.db      = new dbClass(     DOMid       ,"app.database.tableUx");
    this.tableUx = new tableUxClass("tableUXDOM","app.database.tableUx");
}


async main(){ // client side databaseClass
    document.getElementById("footer").innerHTML = ""  ;   // get rid of footer
    // hard code database to load
    await this.db.load(this.url);
    // display table menu
    this.db.displayMenu(this.DOMid,"app.database.load(this)"); // add onclick code
}


async load(DOM) {  // client side databaseClass
    // user clicked on table, so show it.
    const value = DOM.value;
    this.tableUx.setModel(this.db,value);
    this.tableUx.setColumnFormat(0, 'onclick="app.database.showForm(this)"');
    this.tableUx.display();  // display table
}

showForm(
  element // dom element
){
  const index = parseInt(element.previousElementSibling.innerText,10);
  let html = "<table>";
  const table = this.tableUx.getModel()
  const  row = table.getRows()[index];
  const  header = table.getHeader();
  for(var i=0; i<row.length; i++) {
    html += `<tr><td>${header[i]}</td> <td>${row[i]}</td></tr>`
  }
  html += "</table>"
  document.getElementById("record").innerHTML = html;
}


loadLocalCSV( // client side databaseClass
    // user selected a new CSV file from their local drive, load it into memory and add it to the table menu
    element  // DOM
    ) {
    
    const fr = new FileReader();
    fr.onload =  () => {
      // call back function when file has finished loading
      const table  = this.db.tableAdd(element.files[0].name);       // create table and add to db
      const csv     = new csvClass(table);     // create instace of CSV object
      csv.parseCSV(fr.result, "msg");         // parse loaded CSV file and put into table
      this.db.displayMenu(this.DOMid,"app.database.load(this)"); // add onclick code
    };
    fr.readAsText( element.files[0] ); // will only read first file selected
  }


async saveDB( // client side databaseClass
  // user clicked on save to server button
  ){
  const buffer = this.db.save()
  const proxy = new proxyClass();
  const msg   = await proxy.RESTpost( buffer ,this.url);
  alert(`save status = ${msg.statusText}`);
}


/*prefix # with methods that are private
#private(){  
    alert("private");
}
*/

}

export {databaseClass};


new databaseClass("database","databaseDOM");
app.database.main();