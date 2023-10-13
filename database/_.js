/*  database spa (single page app */

import { csvClass    } from '/_lib/db/csv_module.js'      ;
import { dbClass     } from '/_lib/db/dbModule.js'        ;
import { tableUxClass} from '/_lib/db/tableUxModule.js'   ;

import { menuClass   } from '/_lib/UX/menuModule.js'      ;
import {loginClass   } from '/_lib/UX/loginModule.js'     ;
import {proxyClass   }   from '/_lib/proxy/proxyModule.js';

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
    this.login        = new loginClass();
    this.proxy        = new proxyClass();
    this.#url_dir     = dir;
    this.#url         = `${dir}/_.json`;  // json file that contains meta data for databases
    this.#DOMid_db    = DOMid_db   ; // where on the page the database interacts with the user
    this.#DOMid_table = DOMid_table; // where on the page the table interacts with the use
    this.tableUX;     // "table1UX" or "table2UX"
  }


async main(){ // client side dbUXClass - for a page
  if (await app.login.getStatus()) {
		// user logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText(`/synergyData/${app.pageName}/menu.html`) ;
		document.getElementById("userName"  ).innerHTML = `User: ${localStorage.nameFirst} ${localStorage.nameLast}`
	} else {
		// user not logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText("./menu.html")
    return;
	}

  // user opened database app
  this.db        = new dbClass(this.#DOMid_db ,"app.tableUX");
  this.menu      = new menuClass("menu_page");

  // setup  this.table1UX
  this.table1UX  = new tableUxClass("table1UXDOM","app.spa.table1UX");
  this.table1UX.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download","groupBy"]);
  this.table1UX.setRowNumberVisible(false);

  // setup  this.table2UX
  this.table2UX  = new tableUxClass("table2UXDOM","app.spa.table2UX");
  this.table2UX.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download","groupBy"]);
  this.table2UX.setRowNumberVisible(false);

  // setup  this.tableUXRelations
  this.tableUXRelations  = new tableUxClass("relationUXDOM","app.tableUXRelations");
  this.tableUXRelations.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download","groupBy"]);
  this.tableUXRelations.setRowNumberVisible(false);

  // load list of databases available
  const obj  = await app.proxy.getJSONwithError(this.#url);
  // get list of databases
  if(obj.json === null) {
    alert(`error loading "${this.#url}"`);
    return;  // no point in going foward
  }

  this.#json_db  = obj.json;   // get list of databases
  document.getElementById("footer").innerHTML = ""    ;   // get rid of footer

  // build database menu
  const db       = this.#json_db.meta.databases;          
  const dbkey    = Object.keys(db);
  let html = `<select size="4" onclick="app.spa.database_select(this)">`;
  // build list of databases to choose
  for(let i=0; i<dbkey.length; i++ ) {
    html += `<option value="${dbkey[i]}">${dbkey[i]}</option>`;
  }
  html += "</select>"

  // display menu
  this.menu.init();
  this.menu.add(`
    <td>
    <a onclick="app.database_dialog()">Databases</a><br>
    ${html}
    </td>
    `);
}


async database_select( // client side dbUXClass
  // user clicked on a database - show tables inside database
  dom  //
) {
  const v = dom.value;                                          // database user clicked on

  // make sure user is logged in
  if (! await app.login.getStatus()) {
    alert("please log before using the database")
    window.location.replace("app.html?p=logInOut");
}
  const dburl = `${this.#url_dir}/${dom.value}/_.json`;
  await this.db.load(dburl);   // load the database

  // display table1 menu
  this.menu.deleteTo(1);   // remove menues to the right of database memnu
  this.menu.add(`
  <td>
  <a onclick='app.spa.table_dialog()'>Tables 1</a><br>
  <div id='menu_page_table1'></div>
  </td>
  `);


  // display table2 menu
  this.menu.add(`
  <td>
  <a onclick='app.spa.table_dialog()'>Tables 2</a><br>
  <div id='menu_page_table2'></div>
  </td>
  `);


  // create relation index
  this.display_db_menu();
  this.relation_creat_index();
  }


display_db_menu(){
    this.db.displayMenu("menu_page_table1","app.spa.display_tables(this,'table1UX')"); // display tables in database
    this.db.displayMenu("menu_page_table2","app.spa.display_tables(this,'table2UX')"); // display tables in database}
}

relation_creat_index( // client side dbUXClass
){
  /* walk relation_table
  this.relation_index = {
    "table1":{
      "pk1":[list of pks into relation]
      ...
      "pkN":[list of pks into relation ]

     }
    ,"tableN":{...}
  }
  */
  this.relation_index = {};
  const relations = this.db.getTable("relations");
  const pks       = relations.get_PK();    // array of PK keys for entire table;
  for(let i=0; i< pks.length; i++) {
    let row = relations.get_object(pks[i]);  // row as a json object
    this.relation_add_PK(row.id, row.table_1, row.PK_1);
    this.relation_add_PK(row.id, row.table_2, row.PK_2);
  }
}


relation_add_PK(  // client side dbUXClass
   id          // relation id
  ,table_name  // of relation
  ,pk          // primary key of table

){
  if (typeof(this.relation_index[table_name]) === "undefined") {
    // create empty object
    this.relation_index[table_name] = {};
  }

  if (typeof(this.relation_index[table_name][pk]) === "undefined") {
    // create empty array
    this.relation_index[table_name][pk] = []; 
  }

  this.relation_index[table_name][pk].push(id);
}

database_dialog(  // client side dbUXClass

){
  document.getElementById('menu_dialog').innerHTML = `
  <table><tr><td>
  <b>Database Operation</b><br>
  <select size="4" onclick="app.spa.database_dialog_process(this)">
  <option value="new">New</option>
  <option value="delete">Delete</option>
  <option value="cancel">Cancel</option>
  </select></td>
  <td id='dialog_detail'></td>
  </tr>
  </table>`;
}


database_dialog_process(  // client side dbUXClass - for a page
  dom
  ){
  switch(dom.value) {
    case "cancel":
      // code block
      document.getElementById('menu_dialog').innerHTML = "";
      break;

    case "delete":
      // code block
      //break;

    case "delete":
      // code block
      //break;      

    default:
      document.getElementById('dialog_detail').innerHTML = `"${dom.value}" not yet implemented for database`
  }
}


table_dialog(  // client side dbUXClass - for a page
    ){
  document.getElementById('menu_dialog').innerHTML =  `
  <table><tr><td>
  <b>Table Operation</b><br>
  <select size="6" onclick="app.spa.table_dialog_process(this)">
  <option value="new">New</option>
  <option value="delete">Delete</option>
  <option value="columns">Columns</option>
  <option value="import">Import</option>
  <option value="cancel">Cancel</option>
  </select></td>
  <td id='dialog_detail'></td>
  </tr>
  </table>`;
}


table_dialog_process(  // client side dbUXClass - for a page
    dom
    ){
    switch(dom.value) {
      case "cancel":
        document.getElementById('menu_dialog').innerHTML = "";
        break;

      case "import":
        document.getElementById('dialog_detail').innerHTML = `
        <p><b>import csv file</b><br>
        <input type='file' accept='.csv' multiple="multiple" onchange='app.spa.loadLocalCSV(this)'><br>
        <textarea id='msg'></textarea>
        </p>
        <p>imported CSV file will appear in above table list</p>`;
        break;

      case "new":
        // code block
        //break;

      case "delete":
        // code block

        //</input>break;

      default:
        // code block
        document.getElementById('dialog_detail').innerHTML = `"${dom.value}" table is not yet implemented`
    }
  }


display_tables(   // client side dbUXClass
  // user clicked on a table 
   DOM       // DOM.value is table user clicked on
  ,tableUX   // table1UX or table2UX  - 
  ) { 

    this.tableUX = tableUX;  // remember 

    // hide tableUX not clicked on 
    if (tableUX  === "table1UX" ) {
      this.table2UX.set_hidden(true);
    } else {
      this.table1UX.set_hidden(true);
    }

    this[tableUX].set_hidden(false);  // show tableUX clicked on                                   


    this[tableUX].setColumnFormat(   0, `onclick="app.spa['${tableUX}'].recordUX.show(this)"`);  // assume primary key is 0 -  needs to be done in code
    this[tableUX].setColumnTransform(0, app.displayIndex                );  // style it like a hyper link so it will get clicked on.
    this[tableUX].setModel(this.db,  DOM.value                          );  // attach data to viewer
    const table = this[tableUX].getModel();
    this[tableUX].display(table.PK_get()                                );   // display table

    // show button to create a new record
    this[tableUX].recordUX.buttonsShow("new");

}



display_relations(   // client side dbUXClass
  ) {   
    // user clicked on table, so show it.
   // this.tableUXRelations.setColumnFormat(   0, 'onclick="app.spa.recordShow(this)"');  // assume primary key is 0 -  needs to be done in code
    this.tableUXRelations.setColumnTransform(0, this.displayIndex                );  // style it like a hyper link so it will get clicked on.
    this.tableUXRelations.setModel(this.db,  "relations"                             );  // attach data to viewer
    const table = this.tableUXRelations.getModel();
    // get list of relations from relation_index
    const table_name = this[this.tableUX].tableName;
    let array = [];
    if(this.relation_index[table_name] && this.relation_index[table_name][this.#primary_key_value]) {
      // convert undevined to empty array
      array = this.relation_index[table_name][this.#primary_key_value];
    }
    this.tableUXRelations.display( array);   // display table
}



displayIndex(// client side dbUXClass
  value) {    
  return `<u style="color:blue;">${value}</u>`;  // style it like a hyper link so it will get clicked on.
}


loadLocalCSV( // client side dbUXClass - for a page
    // user selected a new CSV file from their local drive, load it into memory and add it to the table menu
    element  // DOM
    ) {
    
    this.fr = new FileReader();

    this.fr.onload =  () => {
      // call back function when file has finished loading
      let name      = element.files[this.i].name;
      name          = name.slice(0, name.length -4);                    // get rid of .csv in table name
      const table   = this.db.tableAdd(name);                           // create table and add to db
      const csv     = new csvClass(table);                              // create instace of CSV object
      csv.parseCSV(this.fr.result, "msg");                                   // parse loaded CSV file and put into table
      this.display_db_menu();

      this.i ++ // process next file import
      if (this.i < element.files.length) {
        this.fr.readAsText( element.files[this.i] ); // import next file
      }
    };

    this.i = 0;
    this.fr.readAsText( element.files[this.i] ); // read first file
}


async saveDB( // client side dbUXClass - for a page
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}


show_changes(){ // client side dbUXClass - for a page
  let html = "";
  const table        = this.tableUX.getModel();  // get tableClass being displayed
  const changes      = table.changes_get();
  const primary_keys = Object.keys(changes);table
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

}

export {dbUXClass};

app.spa = new dbUXClass("/users/database");  // need some parmeres
app.spa.main();
