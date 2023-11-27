/*  database spa (single page app) */

import {csvClass    } from '/_lib/db/csv_module.js'     ;
import {dbClass     } from '/_lib/db/db_module.js'      ;
import {tableUxClass} from '/_lib/db/tableUx_module.js' ;

import {menuClass   } from '/_lib/UX/menu_module.js'    ;
import {loginClass  } from '/_lib/UX/login_module.js'   ;
import {proxyClass  } from '/_lib/proxy/proxy_module.js';

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


constructor( // client side dbUXClass - for a spa
    dir    // user directory that database is in
){
    this.login        = new loginClass();
    this.proxy        = new proxyClass();
    this.#url_dir     = dir;
    this.#url         = `${dir}/_.json`;  // json file that contains meta data for databases
    this.tableUX      = null;     // object contains one tableUXClass attribute for each table, init when user chooses database to open
    this.table_active = "";  
  }


async main(){ // client side dbUXClass - for a spa
  document.getElementById("footer").innerHTML = ""    ;   // get rid of footer

  if (await app.login.getStatus()) {
		// user logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText(`/synergyData/spa/${app.pageName}/menu.html`) ;
		document.getElementById("userName"  ).innerHTML = `User: ${localStorage.nameFirst} ${localStorage.nameLast}`
	} else {
		// user not logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText("./menu.html");
    alert("Login to use database single page application")
    return;
	}

  // user opened database app
  this.db        = new dbClass();
  if(!await this.db.load_db_list(this.#url)) {
     // error no need to go furter
    return; 
  }
  this.menu      = new menuClass("menu_page");

  // create menu and tableUX's
  this.menu_db_list();
}


menu_db_list() {
  // show list of databases
  const db = this.db.get_database_list();    // is an array of database names
  let html = `<select size="4" onclick="app.spa.database_select(this)">`;
  // build list of databases to choose
  for(let i=0; i<db.length; i++ ) {
    html += `<option value="${db[i]}">${db[i]}</option>`;
  }
  html += "</select>"

  // display menu
  this.menu.init();
  this.menu.add(`
    Databases<br>
    ${html}
    `);
}


async database_select( // client side dbUXClass
  // user clicked on a database - show tables inside database
  dom  //  dom.value is database name user clicked on.
) {

  this.table_active = "";  // have not yet selected a table
  // make sure user is logged in
  if (! await app.login.getStatus()) {
    alert("please log before using the database")
    window.location.replace("app.html?p=logInOut");
    return;
  }

  // load the database
  await this.db.load(dom.value);  

  // display table menu
  this.menu.deleteTo(1);   // remove menues to the right of database memnu
  this.menu.add(`
  Tables
  <div id='menu_page_tables' style="min-width:100px;"></div>
  `);

  // add menu
  this.menu.add(`<div style="display:flex">
  <div>
  <b>Table Operation</b><br>
  <select id="table_operations" size="6" onclick="app.spa.table_process(this)">
  <option value="import">Import</option>
  <option value="new"   >New</option>
  </select>
  </div>
  <div id='dialog_detail' style="margin:10px 10px 10px 10px;"></div>
  </div>`);

  // create relation index
  this.display_db_tables();
  this.relation_creat_index();
  }


display_db_tables(// dbClass - client-side
  // create menu of tables to display, and tableUX for each table
   domID        // where to output menu
) {
   //   this.db.displayMenu("",""); // display tables in database
  // build menu list
  let html_menu     = `<select size="9" onclick="app.spa.table_select(this,'table1UX')">`;
  let html_tableUX  = "";
  let html_recordUX = "";
  this.tableUX  = {}; // init
  Object.keys(this.db.tables).forEach((table, i) => {
    html_menu          += `<option value="${table}">${table}</option>`;
    html_tableUX       +=  `<div id="tableUX_${table}"></div>`
    html_recordUX      +=  `<div id="tableUX_${table}_record"></div>`
    this.tableUX[table] = new tableUxClass(`tableUX_${table}`,`app.spa.tableUX['${table}']`);
    this.tableUX[table].setModel(this.db,table);
  });
  html_menu += `</select>`;

  document.getElementById("menu_page_tables").innerHTML = html_menu;     // add table menu to dom
  document.getElementById("tableUXs"        ).innerHTML = html_tableUX;  // add place to display each table in dom
  document.getElementById("recordUXs"       ).innerHTML = html_recordUX; // add place to display a record for each table in dom
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


toggle(
  section_name  // client side dbUXClass - for a spa
) {
  const section = document.getElementById(section_name);
  const menu    = document.getElementById(section_name+"_menu");
  if (section && menu) {
    // toggle visibiltuy of section
    section.style.display = section.style.display === "none" ? "block" : "none";
    // make menu visibilty oposite of section
    menu.style.display    = section.style.display === "none" ? "inline" : "none";
  } else {
    // error
    alert(`error file="dbUXClass.js method="toggle" section_name="${section_name}"`);
  }
}



show(
  section_name  // client side dbUXClass - for a spa
) {
  const section = document.getElementById(section_name);
  const menu    = document.getElementById(section_name+"_menu");
  if (section && menu) {
    // show section
    section.style.display = "block";
    // make menu visibilty oposite of section
    menu.style.display    = section.style.display === "none" ? "inline" : "none";
  } else {
    // error
    alert(`error file="dbUXClass.js method="show" section_name="${section_name}"`);
  }
}


database_dialog_process(  // client side dbUXClass - for a spa
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


table_process(  // client side dbUXClass - for a spa
    dom
    ){
    let detail;

    // see if 
    switch(dom.value) {
      
    case "import":
      detail = `
      <p><b>import csv file</b><br>
      <input type='file' accept='.csv' multiple="multiple" onchange='app.spa.loadLocalCSV(this)' ><br>
      <textarea id='msg'></textarea>
      </p>
      <p>imported CSV file will appear in above table list</p>`;
      break;
    
    case "new":
      detail = `create a new table<br>
      <input type="text" id="new_table_name" placeholder="Enter Table Name"><br>
      <input type="button" value="New" onclick="app.spa.new();">`
      break;

    case "remove":
      // table
      detail = `<p>remove database link to table.  Table will not be deleted.
      <input type='button' onclick='app.spa.remove();'></p>`;
      break;

    case "save":
      document.getElementById('dialog_detail').innerHTML = `<p>Changes will be saved.
      <input type='button' value="Save" onclick='app.spa.save();'></p><p id="changes"></p>`;
      this.show_changes();
      break;

    default:
      // code block
      detail = `Error, file="synergyData/spa/database/_.js}" method="table_process" dom="${dom.value}" `
    }

    document.getElementById('dialog_detail').innerHTML = detail;
  }


async new(){  // client side dbUXClass - for a spa
  // add table template
  const table = `
{
"meta" : {
  "fields" : {
     "pk"        : {"header" : "PK"         , "type" : "pk"     , "location" : "column"  }
    ,"label"     : {"header" : "Label"      , "type" : "string" , "location" : "column"  }
    ,"display"   : {"header" : "Display"    , "type" : "string" , "location" : "column"  }
    ,"comment"   : {"header" : "Commement"  , "type" : "string" , "location" : "column"  }
    ,"relations" : {"header" : "Relations"  , "type" : "string" , "location" : "relation"}
  }
  ,"select"  : ["pk","label","display","comment","relations"]
  ,"PK"      : {}
  ,"PK_max"  : 0
  ,"index"   : []
  ,"deleted" : {}
  }

,"columns" : {
   "pk"          : {}
  ,"label"       : {}
  ,"display"     : {}
  ,"comment"     : {}
  ,"description" : {}
  }
,"relation":{}
}
`
  const name = document.getElementById("new_table_name").value;
  if (name === "") {
    alert("must enter name of table");
    return;
  }
  const url = `${this.db.dir}/${name}/_.json`
  const msg = await app.proxy.RESTpost(table, url);
  alert(`save status = ${msg.statusText} 
  file=${url}`);
  
  // update database metadata

  }



remove(){
    // delete table

  }

copy2record(   // client side dbUXClass
  ux  // "1" or "2"
  ){
  // get html for record_data
  document.getElementById(`record${ux}`).innerHTML = document.getElementById(`tableUX_${this.table_active}_record_data`).innerHTML;
}


table_select(   // client side dbUXClass
  // user clicked on a table - so display it
   DOM       // DOM.value is table user clicked on
  ) { 
    if (this.table_active === "") {
      // first table is selected, so add more options
      document.getElementById("table_operations").innerHTML += `
      <option value="save"    >Save</option>
      <option value="remove"  >Remove</option>
      <option value="columns" >Column</option>
      `
    }
    this.table_active = DOM.value;  // remember active table - (safari does not suport style="display:none;" on optons tag, )


    // hide all tables and records
    this.db.get_table_names().forEach((table, i) => {
      document.getElementById(`tableUX_${table}`       ).style.display = "none";
      document.getElementById(`tableUX_${table}_record`).style.display = "none";
    })

    // show table & record clicked on
    document.getElementById(`tableUX_${DOM.value}`       ).style.display = "block";
    document.getElementById(`tableUX_${DOM.value}_record`).style.display = "block";
    const ux = this.tableUX[DOM.value];
    ux.display( ux.getModel().PK_get()  );  // display table

    this.show("tables"   );  // show the tables section
    this.show("records"  );  // show record section
    ux.recordUX.createUX();  // create recordStructure if not already there
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


loadLocalCSV( // client side dbUXClass - for a spa
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
      csv.parse_CSV(this.fr.result, "msg");                                   // parse loaded CSV file and put into table
      this.display_db_tables();

      this.i ++ // process next file import
      if (this.i < element.files.length) {
        this.fr.readAsText( element.files[this.i] ); // import next file
      }
    };

    this.i = 0;
    this.fr.readAsText( element.files[this.i] ); // read first file
}

/*async save(  // dbClass - client-side
  // save changed loaded tables to disk
) {
  let save_new_meta  = false
  const keys = Object.keys(this.tables);  // keys to loaded tables
  // walking all tables in database to see if they have canged or or new
  for(var i=0; i< keys.length; i++) {
    // save all loaded tables that have changed
    await this.tables[keys[i]].save2file();  // will return quickly if no changes
    if ( typeof(this.#json.meta.tables[keys[i]]) ===  "undefined") {
      this.#json.meta.tables[keys[i]] = {"location": keys[i], comments: "imported table"}
      save_new_meta = true;
    }
  }

  if (save_new_meta) {
    // have a new table or tables, add it to meta data
    await app.proxy.RESTpost(
      `{
        "meta":{
          "tables": ${JSON.stringify(this.#json.meta.tables)}
        }
      }`, this.#url);
  }
}*/


async save( // client side dbUXClass - for a spa
  // user clicked on save table button 
  ){
  await this.db.getTable(this.table_active).save2file(); 
  this.show_changes();
}


async saveDB( // client side dbUXClass - for a spa
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}


show_changes(){ // client side dbUXClass - for a spa
  let html = "";
  const table        = this.db.getTable(this.table_active);  // get tableClass being displayed
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
  document.getElementById("changes").innerHTML = html
}

}

export {dbUXClass};

app.spa = new dbUXClass("/users/database");  
app.spa.main();
