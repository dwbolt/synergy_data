//  database page

import { dbClass     } from '/_lib/db/dbModule.js'      ;
import { tableClass  } from '/_lib/db/tableModule.js'   ;
import { csvClass    } from '/_lib/db/csvModule.js'     ;

import { tableUxClass} from '/_lib/UX/tableUxModule.js' ;
import { proxyClass  } from '/_lib/proxy/proxyModule.js';

class dbUXClass { // client side dbUXClass - for a page

  #url       
  #DOMid
  #primary_key_value
  #edit_type          // true -> table       false -> buffer

constructor( // client side dbUXClass - for a page
    dir    // user directory that database is in
   ,DOMid  // 
){  
    app.page      = this;   // get access to instance by app.contacts;

    this.#url     = `/users/${dir}/_.json`;  
    this.#DOMid   = DOMid;   // where on the page the database interacts with the use
    this.db       = new dbClass(     DOMid       ,"app.page.tableUX");
    this.tableUX  = new tableUxClass("tableUXDOM","app.page.tableUX");
    this.tableUX.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download"]);   // ,"groupBy"
    this.tableUX.setRowNumberVisible( false);
}


async main(){ // client side dbUXClass - for a page
    document.getElementById("footer").innerHTML = ""  ;   // get rid of footer
    await this.db.load(this.#url);                        // load the database
    // display table menu
    this.db.displayMenu(this.#DOMid,"app.page.display(this)"); // add onclick code
}


display(DOM) { 
    // user clicked on table, so show it.
    this.tableUX.setColumnFormat(   0, 'onclick="app.page.showForm(this)"');   // assume primary key is 0 -  needs to be done in code
    this.tableUX.setColumnTransform(0, app.page.displayIndex)
    
    this.tableUX.setModel(this.db,  DOM.value );
    this.tableUX.display();  // display table
}


displayIndex(value) {   // client side dbUXClass - for a page
  return `<u style="color:blue;">${value}</u>`;  // style it like a hyper link so it will get clicked on.
}


loadLocalCSV( // client side dbUXClass - for a page
    // user selected a new CSV file from their local drive, load it into memory and add it to the table menu
    element  // DOM
    ) {
    
    const fr = new FileReader();
    fr.onload =  () => {
      // call back function when file has finished loading
      const table  = this.db.tableAdd(element.files[0].name);       // create table and add to db
      const csv     = new csvClass(table);     // create instace of CSV object
      csv.parseCSV(fr.result, "msg");         // parse loaded CSV file and put into table
      this.db.displayMenu(this.#DOMid,"app.database.load(this)"); // add onclick code
    };
    fr.readAsText( element.files[0] ); // will only read first file selected
  }


async saveDB( // client side dbUXClass - for a page
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}




showForm(  // client side dbUXClass - for a page
  element // dom element
){
  let html = "<table>";
  const table             = this.tableUX.getModel()  // get tableClass being displayed
  if (element) {
    // user clicked on elemnt, remember primary key for other record methodes
    this.#primary_key_value = parseInt(element.innerText,10); 
  }
  const  row = table.getRowByIndex(table.get_primary_key(), this.#primary_key_value); 
  const  header = table.getHeader();
  for(var i=0; i<row.length; i++) {
    html += `<tr><td>${header[i]}</td> <td>${row[i]}</td></tr>`
  }
  html += "</table>"
  document.getElementById("record").innerHTML = html;
}


recordEdit(
  edit_type // true -> edit table record    false -> edit buffer record
){// client side dbUXClass - for a page
  this.#edit_type = edit_type;
  let html = "<table>";
  const table  = this.tableUX.getModel();  // get tableClass being displayed
  const row    = (this.#edit_type ? 
    table.getRowByIndex(table.get_primary_key(), this.#primary_key_value) :
    table.bufferGet(0)[1] );  // hard code for one record case 
  const header = table.getHeader();

  for(var i=0; i<row.length; i++) {
    if (i === table.get_primary_key()) {
      // do not allow editing of primary key
      html += `<tr><td>${header[i]}</td> <td>${row[i]}</td></tr>`
      this.#primary_key_value = row[i];
    } else {
      html += `<tr><td>${header[i]}</td> <td><input id='edit-${i}' type='text' value='${row[i]}'></td></tr>`
    }

  }
  html += "</table>"
  document.getElementById("record").innerHTML = html;
}

recordSave(){  // client side dbUXClass - for a page
  // save to memory
  const table     = this.tableUX.getModel();  // get tableClass being displayed
  const  row      = table.getRowByIndex(table.get_primary_key(), this.#primary_key_value);    // get row being displayed
  const rowEdited = [];
  for(var i=0; i<row.length; i++)  {
      let edit = document.getElementById(`edit-${i}`);
      if (edit) {
        // value input
        rowEdited[i] = edit.value;
      }
  }
  table.save2memory(this.#primary_key_value, rowEdited);
  this.show_changes();
  this.showForm();
}

recordDelete(){// client side dbUXClass - for a page
  alert("recordDelete from memery, not implemented yet")
}


show_changes(){ // client side dbUXClass - for a page
  let html = "";
  const table        = this.tableUX.getModel();  // get tableClass being displayed
  const changes      = table.get_changes();
  const primary_keys = Object.keys(changes);
  for(var i=0; i<primary_keys.length; i++) {
    let key = primary_keys[i]
    html += `key=${key}<br>`;
    // show on changed field per line
    let fields = Object.keys(changes[key]);
    for(var ii=0; ii<fields.length; ii++) {
      html += ` &nbsp;&nbsp;field = ${fields[ii]} &nbsp;&nbsp; obj=${JSON.stringify(changes[key][fields[ii]])}<br>`
    }
  }
  document.getElementById("mchanges").innerHTML = html
}


recordNew(){// client side dbUXClass - for a page
  //
  const table = this.tableUX.getModel();  // get tableClass being displayed
  table.bufferCreateEmpty(1);
  this.recordEdit(false);
}

recordDuplicate(){// client side dbUXClass - for a page
  alert("recordDuplicate from memery, not implemented yet")
}




recordDelete(){// client side dbUXClass - for a page
  alert("recordDelete from memery, not implemented yet")
}



/*prefix # with methods that are private
#private(){  
    alert("private");
}
*/

}

export {dbUXClass};


new dbUXClass("database/matthew","databaseDOM");  // hardcode database for now, later support multiple databases per user
app.page.main();