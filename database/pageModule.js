import { csvClass    } from '/_lib/db/csvModule.js'       ;
import { dbClass     } from '/_lib/db/dbModule.js'        ;
import { tableUxClass} from '/_lib/UX/tableUxModule.js'   ;
import { menuClass   } from '/_lib/UX/menuModule.js'      ;

import { proxyClass  } from '/_lib/proxy/proxyModule.js'  ;


class dbUXClass { // client side dbUXClass - SPA (Single Page App)

  /*

 supports RDBMS in users space

  */

  #url          // points to db json file
  #url_dir      // directory json file is in
  #json_db      // loaded file
  #DOMid_db     // where database is selected
  #DOMid_table  // where table is selected
  #primary_key_value
  #edit_type          // true -> table       false -> buffer

constructor( // client side dbUXClass - for a page
    dir    // user directory that database is in
   ,DOMid_db     // 
   ,DOMid_table  // 
){
    this.#url_dir     = dir;
    this.#url         = `${dir}/_.json`;  // json file that contains meta data for databases
    this.#DOMid_db    = DOMid_db   ; // where on the page the database interacts with the user
    this.#DOMid_table = DOMid_table; // where on the page the table interacts with the use

    this.db       = new dbClass(this.#DOMid_db ,"app.page.tableUX");
    this.proxy    = new proxyClass();
    this.menu     = new menuClass("menu_page");
    this.tableUX  = new tableUxClass("tableUXDOM","app.page.tableUX");
    this.tableUX.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","groupBy"]);
    this.tableUX.setRowNumberVisible(false);
  }


async main(){ // client side dbUXClass - for a page
    document.getElementById("footer").innerHTML = ""    ;   // get rid of footer
    this.#json_db  = await this.proxy.getJSON(this.#url);   // get list of databases

    // build database menu
    const db       = this.#json_db.meta.databases;          
    const dbkey    = Object.keys(db);
    let html = `<select size="4" onclick="app.page.select_database(this)">`;
    // build list of databases to choose
    for(let i=0; i<dbkey.length; i++ ) {
      html += `<option value="${dbkey[i]}">${dbkey[i]}</option>`;
    }
    html += " </select>";

    // display menu
    this.menu.add(`
      <td>
      <h4>Databases</h4>
      ${html}
      </td>
      `);
}


async select_database(
  // user clicked on a database
  dom  //
) {
  const v = dom.value;                                          // database user clicked on
  await this.db.load(`${this.#url_dir}/${dom.value}/_.json`);   // load the database

  // display table menu
  this.menu.deleteTo(1);   // remove menues to the right of database memnu
  this.menu.add(`
  <td>
  <h4>Tables</h4>
  <p id='menu_page_table'></p>
  <p><b>import csv file</b><br>
  <input type='file' accept='.csv' onchange='app.page.loadLocalCSV(this)'><br>
  <textarea id='msg'></textarea>
  </p>
  </td>
  `);
  this.db.displayMenu("menu_page_table","app.page.display(this)"); // display tables in database
  }


display(DOM) { 
    // user clicked on table, so show it.
    this.tableUX.setColumnFormat(   0, 'onclick="app.page.showForm(this)"');   // assume primary key is 0 -  needs to be done in code
    this.tableUX.setColumnTransform(0, app.page.displayIndex              );   // // style it like a hyper link so it will get clicked on.
    
    this.tableUX.setModel(this.db,  DOM.value );
    this.tableUX.display();  // display table
    this.buttonsShow("New")
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
      let name      = element.files[0].name;
      name          = name.slice(0, name.length -4);                    // get rid of .csv in table name
      const table   = this.db.tableAdd(name);                           // create table and add to db
      const csv     = new csvClass(table);                              // create instace of CSV object
      csv.parseCSV(fr.result, "msg");                                   // parse loaded CSV file and put into table
      this.db.displayMenu("menu_page_table","app.page.display(this)");  // display new table in menu
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
  // showForm
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

  // show buttons
  this.buttonsShow("New Duplicate Edit  Delete Cancel");
}


recordEdit(
  edit_type // true -> edit table record    false -> edit buffer record
){// client side dbUXClass - for a page
  this.#edit_type = edit_type;
  let html = "<table>";
  const table  = this.tableUX.getModel();  // get tableClass being displayed
  const row    = (this.#edit_type ? 
    table.getRowByIndex(table.get_primary_key(), this.#primary_key_value) :
    table.bufferGet(0));  // hard code for one record case 
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
  this.buttonsShow("Save Cancel");
}

recordSave(){  // client side dbUXClass - for a page
  // save to memory
  const table  = this.tableUX.getModel();  // get tableClass being displayed
  const row    = table.getRowByIndex(table.get_primary_key(), this.#primary_key_value);    
  const rowEdited = [];

  // fill rowEdited with values from edit form
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
  const changes      = table.changes_get();
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
  this.buttonsShow("Add Cancel");
}


recordAdd(){// client side dbUXClass - for a page
  // similar to save, move data from buffer to memory, then save
  const table = this.tableUX.getModel();  // get tableClass being displayed

  table.bufferAppend();       // move buffer data to table
  this.recordSave();          // update table data from form
  this.tableUX.displayData();  //
}


recordCancel(){// client side dbUXClass - for a page
  // similar to save, move data from buffer to memory, then save
  document.getElementById("record").innerHTML = "";
  this.buttonsShow("New");
}


buttonsShow( // client side dbUXClass - for a page
  // "New Add  Edit Duplicate Delete Save  Cancel"
  s_values   // walk through id=Buttons and show all in the list   
){  // client side dbUXClass - for a page
  let button = document.getElementById("buttons_record").firstChild;
  while(button) {
    button.hidden = (s_values.includes(button.value) ? 
      false  // show button
    : true  )// hide button
    button = button.nextSibling;
  }
}


recordDuplicate(){// client side dbUXClass - for a page
  alert("recordDuplicate from memery, not implemented yet")
}


recordDelete(){// client side dbUXClass - for a page
  //
  alert("recordDelete from memery, not implemented yet");
  return;

  this.tableUX.delete(this.#primary_key_value);  
}


}

export {dbUXClass};


app.page = new dbUXClass("/users/database","databaseDOM","tableDOM");  // access loggin users databases
app.page.main();