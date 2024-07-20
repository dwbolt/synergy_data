/*  database spa (single page app) works on a collection of databases */

import {csvClass    }  from '/_lib/db/csv_module.js'     ;
import {dbClass     }  from '/_lib/db/db_module.js'      ;

import {menuClass   } from '/_lib/UX/menu_module.js'    ;
import {loginClass  } from '/_lib/UX/login_module.js'   ;
import {proxyClass  } from '/_lib/proxy/proxy_module.js';

import {relation_class} from './relation_module.js';
import {stack_class   } from './stack_module.js'   ;  // convert to component

// web components that are used in this module
import {table_sfc_class} from '/_lib/db/table-sfc/_.mjs'  ;  //<table-sfc>
import {record_sfc_class} from '/_lib/db/record-sfc/_.mjs';  //<record-sfc>

class dbUXClass { // client side dbUXClass - SPA (Single Page App)
  /*

 user interface to add/edit databases,tables.records RDBMS in users space
select Database/Table
Selected Table
Selected Record  - relation between slected record and stack 
Stack
Relations - display relation of Selected Record
Table 1
records - clicking should display in Stack
...
Table N
record

  */

  #primary_key_value

constructor( // client side dbUXClass - for a spa
){
  this.login     = new loginClass();
  this.proxy     = new proxyClass();
  this.relation  = new relation_class();   // ux to view 
  this.stack     = new stack_class();      // ux to view records in stack, and work with stack
  }


async main( // client side dbUXClass - for a spa
  dir    // user directory that list of databases are in
  ){ 
  this.url_dir      = dir;
  this.db_name      = undefined;
  this.url_meta     = `${dir}/_meta.json`;   // json file that contains meta data for databases
  this.meta         = undefined              // where 
  this.db           = new dbClass();         // will hold selected database
  this.menu         = new menuClass("menu_page"); // where is puturl_meta
  this.tableUX      = {};                    // object contains one tableUXClass attribute for each table, init when user chooses database to open
  this.tableUX_rel  = {};                    // object contains one tableUXClass attribute for each table, used to display relations to an object/record

  this.table_active = {name:""};             // no active table yet
  this.record_relation;                      // ux for record_relation;

  document.getElementById("footer").innerHTML = ""          ;   // get rid of footer
  document.getElementById("db_url").innerHTML = this.url_dir;   // show user were the list of databases is coming from

  if (await app.login.getStatus()) {
		// user logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText(`/synergyData/spa/${app.pageName}/menu.html`) ;
		document.getElementById("user_loggedin"  ).innerHTML = `${localStorage.nameFirst} ${localStorage.nameLast}`
	} else {
		// user not logged in
		document.getElementById("navigation").innerHTML = await this.proxy.getText("./menu.html");
    alert("Login to use database single page application")
    return;
	}

  // user opened database app
  if(!await this.load_db_list()) {
     // error no need to go furter
    return; 
  }
  
  // create menu and tableUX's
  this.menu_db_list();
}


async load_db_list(  // dbClass - client-side
  // load list of databases 
  ) {

  // load list of tables in database
  const obj = await app.proxy.getJSONwithError(this.url_meta);   // get list of tables;
  if(obj.status === 404) {
    alert(`file="syneryData/spa/database/_.js" 
method="load_db_list"
missing url="${this.url_meta}"
creating from template`
    );

    this.meta   = 
    {
      "meta":{
          "comment":"works with db_module.js"
          ,"databases": {}
        }
    }
    // now save it
    let msg = await app.proxy.RESTpost(JSON.stringify(this.meta), this.url_meta );
  } else {
    this.meta   = obj.json; 
  }
  return true;
}


menu_db_list() {  // dbClass - client-side
  // show list of databases
  let html = `<select size="4" onclick="app.spa.database_select(this)">`;
  // build list of databases to choose
  if (this.meta.databases === undefined) { 
    this.meta.databases = {}; // this should not be needed, if 
  }
  const db = Object.keys(this.meta.databases);    // is an array of database names
  for(let i=0; i<db.length; i++ ) {
    html += `<option value="${db[i]}">${db[i]}</option>`;
  }

  html += "</select>"

  // display menu
  this.menu.init();
  this.menu.add(`
  click on database to view it's tables<br>
  <b>Databases</b><br>
  ${html}
  <br>
  <input type="button" value="Database Menu" onclick="app.spa.id_show('database_dialog')"> 
  <p id="database_dialog" style="display:none">
  <b>Database Operation</b><br>
  <select size="4" onclick="app.spa.database_dialog_process(this)">
  <option value="new">New</option>
  <option value="delete">Delete</option>
  <option value="cancel">Cancel</option>
  </select>
  
  <div id="database_dialog_detail"></div>
  </p>`);
}


async database_select( // client side dbUXClass
  // user clicked on a database - show tables inside database
  dom  //  dom.value is database name user clicked on.
) {
  // make sure user is logged in
  if (! await app.login.getStatus()) {
    alert("please log before using the database")
    window.location.replace("app.html?p=logInOut");
    return;
  }

  // load the database
  try {
    const dir_db = this.meta.databases[dom.value].location;
    this.db_name = dom.value;
    await this.db.load(dir_db);
  } catch (error) {
    alert(`
file="spa/database/_.js"
method="database_select"
error="${error}"`);
  }
  

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

  this.db_tables_display();
  this.relation.create_index();
}


db_tables_display(// dbClass - client-side
  // create menu of tables to display, and tableUX and recordUX for each table
) {
  // build menu list
  const action = "app.spa.table_select(this,'table1UX')";
  let html_menu = `<select id="database_tables" size="9" onclick="${action}" oninput="${action}">`;
  let html_tableUX   = "";
  let html_recordUX  = "";
  let html_relations = `<h3><a onclick="app.spa.toggle('relations')"> - </a> Relations</h3>`;
  Object.keys(this.db.tables).forEach((table, i) => {
    html_menu          += `<option value="${table}">${table}</option>`;
    html_tableUX       += `<table-sfc id="table_${table}"></table-sfc>`        ;
    html_recordUX      += `<record-sfc id="table_${table}_record" class="border"/></record-sfc>` ; 
    html_relations     += `<table-sfc id="table_${table}_rel"></table-sfc>`    ;

    //this.tableUX[    table] = new tableUxClass(`tableUX_${table}`,     `app.spa.tableUX['${table}']`    , this.db.getTable(table));  // create table viewer, displayed when user clicks on talbe
    //this.tableUX_rel[table] = new tableUxClass(`tableUX_${table}_rel`, `app.spa.tableUX_rel['${table}']`, this.db.getTable(table));  // create table viewer, displays relations of a selected record
  });
  html_menu += `</select>`;
  //html_recordUX += `<div id="relation_record" class="border"></div>`;  // where user edit/create relation between table recrod and displayed stack record

  document.getElementById("menu_page_tables").innerHTML = html_menu;      // add table menu to dom
  document.getElementById("tableUXs"        ).innerHTML = html_tableUX;   // add place to display each table in dom
  document.getElementById("relations"       ).innerHTML = html_relations; // add place to display a record for each table in dom
  // attach model to viewers
  Object.keys(this.db.tables).forEach((table, i) => {
    document.getElementById(`table_${table}`    ).set_model(this.db.getTable(table),table);
    document.getElementById(`table_${table}_rel`).set_model(this.db.getTable(table),table);
  });
  document.getElementById("recordUXs"       ).innerHTML = html_recordUX;  // add place to display a record for each table in 


  //this.record_relation = new recordUxClass(this.tableUX.relations);   // create ux for create/edit relations
  //this.record_relation.globalName_set("app.spa.record_relation"  );   // this is a seprate from record associated with this.tableUX.relation
  //this.record_relation.dom_ids_set("relation_record"             );   // override default dom locations
  //this.record_relation.html_create(                              );   // create 
  //  refactor this - this.tableUX_rel[table].recordUX = this.stack.stack_record; // all relations display record here
}


id_show(id){  // client side dbUXClass - for a spa
  const element = document.getElementById(id);
  element.style.display = "block";  // will cause problem if element is inline rather than block
}

id_hide(id){  // client side dbUXClass - for a spa
  const element = document.getElementById(id);
  element.style.display = "none";
}

toggle( // client side dbUXClass - for a spa
  section_name  // used to show/hide major section.  If hiden the section shows in the top level menu so the user can later show it.  
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
    alert(`file="spa/database/_.js"
method="toggle" 
section_name="${section_name}"`);
  }
}


show(  // client side dbUXClass - for a spa
  section_name  // force the section to show, remove from menu
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
    alert(`file="spa/database/_.js
method="show"
section_name="${section_name}"`);
  }
}


database_dialog_process(  // client side dbUXClass - for a spa
  dom
  ){
  switch(dom.value) {
    case "new":
      // code block
      this.database_detail_new()
      break;

    case "delete":
      this.database_delete();
      break;

    case "cancel":
      this.id_hide("database_dialog");
      break;      

    default:
      document.getElementById('dialog_detail').innerHTML = `"${dom.value}" not yet implemented for database`
  }
}


async database_delete(){ // client side dbUXClass - for a spa
  await this.db.delete();  // delete database

  // delet from list of databases
  delete this.meta.databases[this.db_name];
  const msg = await app.proxy.RESTpost(JSON.stringify(this.meta),`${this.url_dir}/_meta.json`); // save meta data
  this.menu_db_list();    //
}


database_detail_new(){ // client side dbUXClass - for a spa
  document.getElementById("database_dialog_detail").innerHTML = `
  create a new database<br>
  <input type="text" id="new_database_name" placeholder="Enter Database Name"><br>
  <input type="button" value="Create New Database" onclick="app.spa.database_new();">
  `
}


async database_new(){ // client side dbUXClass - for a spa
  const name = document.getElementById("new_database_name").value;
  if (name==="") {
    alert("must enter database name to create");
    return;
  }
  
  if ( !this.meta.databases[name] === undefined) {
    // test for existance add to list of databases
    alert(`database "${name}" already exists`);
    return;
  }

  // add database name to meta data
  const url_db   = `${this.url_dir}/${name}`;
  const url_meta = `${this.url_dir}/_meta.json`      
  this.meta.databases[name] = {"location": url_db};   
                 
  const msg = await app.proxy.RESTpost(JSON.stringify(this.meta),url_meta); // save meta data
  if (!msg.success) {
    alert(`file="/synergydata/spa/database_.js
method="database_new"
url_meta="${url_meta}"
RESTpost failed to save`);
  }
  await this.db.new(url_db);  // create database 
  this.menu_db_list();    // show new database in menu
}


table_structure(dom){ // client side dbUXClass - for a spa
  // set name of table to be structure, user can change it
  document.getElementById("new_table_name").value = dom.value;
}


async table_process(  // client side dbUXClass - for a spa
    dom
    ){
    let detail;

    // see if 
    switch(dom.value) {
      
    case "import":
      detail = `
      <p><b>import csv file</b><br>
      <input type='file' accept='.csv' multiple="multiple" onchange='app.spa.Local_CSV_load(this)' ><br>
      <textarea id='msg'></textarea>
      </p>
      <p>imported CSV file will appear in above table list</p>`;
      break;
    
    case "new":
      detail = `create a new table<br>
      <select id="table_meta" onChange="app.spa.table_structure(this)">
      <option value="addresses" >addresses</option>
      <option value="calendar"  >calendar</option>
      <option value="default"   selected>default</option>
      <option value="groups"    >groups</option>
      <option value="people"    >people</option>
      <option value="phones"    >phones</option>
      <option value="relations" >relations</option>
      <option value="tasks"     >tasks</option>
      <option value="urls"      >urls</option>
      </select> Select table structure<br>
      <input type="text" id="new_table_name" placeholder="Enter Table Name"><br>
      <input type="button" value="Create New Table" onclick="app.spa.table_new();">`
      break;

    case "delete":
      // table
      detail = `<p>Delete selected table.
      <input type='button' value="Delete" onclick='app.spa.table_delete();'></p>`;
      break;

    case "merge":
      document.getElementById('dialog_detail').innerHTML = `<p>columns will be saved, and a new change file started.
      Need to decide where pk_max is stored, currently it is in meta.json 
      <input type='button' value="Merge" onclick='app.spa.merge();'></p><p id="changes"></p>`;
      return;

    case "meta":
      document.getElementById('dialog_detail').innerHTML = `<p>edit meta
      <input type='button' value="Save" onclick='app.spa.meta_save()'></p><textarea id="meta" rows="20" cols="90"></textarea>`;
      let msg = await app.proxy.RESTget( this.db.getTable(this.table_active.name).dir + "/_meta.json");  // get as text file so we can edit it
      if (msg.ok) {
        document.getElementById('meta').innerHTML = msg.value;
      }
      return;

    default:
      // code block
      detail = `
file="synergyData/spa/database/_.js" 
method="table_process" 
dom.value="${dom.value}"
not implemented`
    }

    document.getElementById('dialog_detail').innerHTML = detail;
  }

async merge(){
  alert(`"file="spa/database/_.js
method="merge"
not fully implemented, resolve pk_max issue before turninng on"`)
  return; 
  const msg = await this.db.table_merge(this.table_active.name); 
}
  
async meta_save() {
  const text = document.getElementById("meta").value;
  const msg = await app.proxy.RESTpost(text, this.db.getTable(this.table_active.name).dir + "/_meta.json");
  if (msg.success) {
    document.getElementById('meta').innerHTML = "save compete"
  } else {
    document.getElementById('meta').innerHTML = "error"
  }
}

async table_new(){  // client side dbUXClass - for a spa
  // update database metadata
  const name = document.getElementById("new_table_name").value;  // get name of table from user
  if (name==="") {
    alert("must enter name of table");
    return;
  }
  const meta_name = document.getElementById("table_meta").value;  // get name of table from user

  // create table in database
  const table = this.db.tableAdd(name);
  await this.db.meta_save()    ;  // save database meta data changes
  await table.create(name,meta_name);  // save meta data
  await table.merge()          ;  // save empty table to server

  // update table list
  this.db_tables_display()
  }


async table_delete(){
  const table_name = this.table_active.name;  // get table to delete
  this.table_active.name = "";

  let msg = await this.db.table_delete(table_name); // have database delete table
  
  delete this.db.tables[table_name];                // delete from database loaded tables
  this.db_tables_display();                         // update table list
  }


table_select(   // client side dbUXClass
  // user clicked on a table - so display it
   DOM       // DOM.value is table user clicked on
  ) { 
    if (this.table_active.name === "") {
      // first table is selected, so add more options
      document.getElementById("table_operations").innerHTML += `
      <option value="merge"  >Merge</option>
      <option value="delete" >Delete</option>
      <option value="meta"   >Meta</option>
      `
    }
    this.table_active.name = DOM.value;  // remember active table - (safari does not suport style="display:none;" on optons tag, )


    // hide all tables and records
    this.db.get_table_names().forEach((table, i) => {
      document.getElementById(`table_${table}`       ).style.display = "none";
      document.getElementById(`table_${table}_record`).style.display = "none";
    })

    // show table & record clicked on
    document.getElementById(`table_${DOM.value}`       ).style.display = "block";
    document.getElementById(`table_${DOM.value}_record`).style.display = "block";
    //const ux = this.tableUX[DOM.value];
    
    document.getElementById(`table_${DOM.value}`       ).display();  // display table
    this.show("tables"   );  // show the tables section

    //document.getElementById(`table_${DOM.value}`       ).recordUX.html_create();  // create recordStructure if not already there
    this.show("records"  );  // show record section
   
}


display_relations(   // client side dbUXClass
  ) {  
    // user clicked on table, so show it.
   // this.tableUXRelations.setColumnFormat(   0, 'onclick="app.spa.recordShow(this)"');  // assume primary key is 0 -  needs to be done in code
    this.tableUXRelations.setColumnTransform(0, this.displayIndex                );  // style it like a hyper link so it will get clicked on.
    this.tableUXRelations.setModel(this.db,  "relations"                         );  // attach data to viewer
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


Local_CSV_load( // client side dbUXClass - for a spa
    // user selected a new CSV file from their local drive, load it into memory and add it to the table menu
    element  // DOM
    ) {
    
    this.fr = new FileReader();

    this.fr.onload =  () => {
      // call back function when file has finished loading
      let name      = element.files[this.i].name;
      name          = name.slice(0, name.length -4);             // get rid of .csv in table name
      const table   = this.db.tableAdd(name);                    // create table and add to db
      const csv     = new csvClass(table);                       // create instace of CSV object
      csv.parse_CSV(this.fr.result, "msg");                      // parse loaded CSV file and put into table
      table.merge(`${this.url_dir}/${name}`);                                             // save import
      this.db_tables_display();

      this.i ++ // process next file import
      if (this.i < element.files.length) {
        this.fr.readAsText( element.files[this.i] ); // import next file
      }
    };

    this.i = 0;
    this.fr.readAsText( element.files[this.i] ); // read first file
}


async saveDB( // client side dbUXClass - for a spa
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}


show_changes(){ // client side dbUXClass - for a spa
  let html = "";
  const table        = this.db.getTable(this.table_active.name);  // get tableClass being displayed
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

app.spa = new dbUXClass();  
await app.spa.main(app.urlParams.get('url'));