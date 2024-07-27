/*  database spa (single page app) allows users to work on a collection of databases */

import {csvClass    }  from '/_lib/db/csv_module.js'     ;
import {dbClass     }  from '/_lib/db/db_module.js'      ;

import {menuClass   } from '/_lib/UX/menu_module.js'    ;
import {loginClass  } from '/_lib/UX/login_module.js'   ;
import {proxyClass  } from '/_lib/proxy/proxy_module.js';

// web components that are used in this module
import {sfc_db_tables_class}        from '/_lib/db/sfc-db-tables/_.mjs'              ;  // <sfc-db-tables>
import {sfc_record_relations_class} from '/_lib/db/sfc-record-relations/_.mjs'       ;  // <sfc-record-relations>
import {sfc_table_class    }        from '/_lib/db/sfc-table/_.mjs'                  ;  // <sfc-table>
import {sfc_record_class   }        from '/_lib/db/sfc-record/_.mjs'                 ;  // <sfc-record>
import {select_order_class }        from '/_lib/web_componets/select-order-sfc/_.mjs';  // <select-order-sfc>

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

//#primary_key_value   // private 

constructor( // client side dbUXClass - for a spa
){
  this.login        = new loginClass();
  this.proxy        = new proxyClass();
  
  this.recordUXs            = document.getElementById("recordUXs");           //  one <sfc-record> for each table
  this.sfc_db_tables        = document.getElementById("sfc-db-tables");       // <sfc-db-tables>
  this.sfc_record_relations = document.getElementById("sfc-record-relations");// <sfc-record-relation>

  this.relation_record       = document.getElementById("relation_record");

  this.stack_record         = document.getElementById("stack_record");        // <sfc-record>
  this.stack_list           = document.getElementById("stack_list");                //  <select-order-sfc>
  this.stack_list.multi_set(false);                                             // hide selected, work with array directly
  this.stack_list.choices_click_custom = this.choices_click_custom.bind(this);  // set custom_click
}


choices_click_custom(event){
  // display slection in stack record
  const index = event.target.value;
  const obj   = this.stack_array[index];
  this.stack_record.table_set( this.db.getTable(obj[1]) );    // set table
  this.stack_record.show(obj[2]);                             // show record with pk
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
  this.tableUX_rel  = {};                    // object contains one tableUXClass attribute for each table, used to display relationstack_pushs to an object/record

  this.table_active = {name:""};             // no active table yet
  this.record_relation;                      // ux for record_relation;
  
  this.stack_array         = [];

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
  let html = `<select size="4" onclick="app.spa.database_select(this.value)">`;
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
  database_name  //  user clicked on
) {
  this.db_name = database_name;

  // make sure user is logged in
  if (! await app.login.getStatus()) {
    alert("please log before using the database")
    window.location.replace("app.html?p=logInOut");
    return;
  }

  // load the database
  try {
    const dir_db = this.meta.databases[database_name].location;
    await this.db.load(dir_db); // load database and tables into memory
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
}


db_tables_display(// dbClass - client-side
  // create menu of tables to display, and <sfc-table> and <sfc-record> web component for each table
) {
  // build table menu list and create web componet viewers
  const action = "app.spa.table_select(this,'table1UX')";
  let html_menu = `<select id="database_tables" size="9" onclick="${action}" oninput="${action}">`;
  let html_recordUX  = "";
  Object.keys(this.db.tables).forEach((table, i) => {
    html_menu          += `<option value="${table}">${table}</option>`  ;
    html_recordUX      += `<sfc-record id="${table}"/></sfc-record>`    ; 
  });
  html_menu += `</select>`;
  document.getElementById("menu_page_tables").innerHTML = html_menu;      // add table menu to dom
  this.recordUXs.innerHTML = html_recordUX;  // add place to display a record for each table in 

  // add function to edit relation for all <sfc-records> in this.recordUXs.children
  const children = this.recordUXs.children;
  for(let i=0; i<children.length; i++) {
    children[i].show_custom = this.relation_edit.bind(this);
  };
  // add function to edit relation for stack_record 
  this.stack_record.show_custom = this.relation_edit.bind(this);

         this.sfc_db_tables.db_set(this.db);   // create shadow dom for web component
  this.sfc_record_relations.db_set(this.db);   // create shadow dom for web component

  // attach table model to viewers & record views to tables
  Object.keys(this.db.tables).forEach((table_name, i) => {
    let model  = this.db.getTable(table_name);

    // set up <sfc-table>  inside <sfc-db-tablses
    let viewer = this.sfc_db_tables.shadow.getElementById(table_name);    // get table viewer  <sfc-table> 
    viewer.relations = this.sfc_record_relations;                         // display relations with record
    viewer.record_sfc = document.getElementById(table_name);              // attach <sfc-record> to  <sfc-table> 

    // set up <sfc-record> used by above table
    viewer = viewer.record_sfc;                                           // get record viewer  <sfc-record> 
    viewer.table_set(model);                                              // attach table    to <sfc-record>

    // setup sfc-record-relations
    viewer = this.sfc_record_relations.shadow.getElementById(table_name); //  
    viewer.record_sfc = this.stack_record;                                // attach <sfc-record> to  <sfc-table> 
  });

  document.getElementById("relation_record").table_set(this.db.getTable("relations"));   // <record_sfc> displays relation record between selected record and stack record 
}


stack_push( // client side dbUXClass - for a spa
record_sfc // user click stack on a record, so add it to the stack
){
  const table  = record_sfc.table;
  const pk     = record_sfc.get_pk();
  const record = table.get_object(pk);

  let display  = table.name + " : " ;
  switch (table.name) {
    case "people": display += `${record.name_last}, ${record.name_first}`                                           ; break;
    case "phones": display += `${record.label} ${record.country_code} (${record.area_code}) ${record.phone_number}` ; break;
    case "groups": display += `${record.name_short} ${record.name_full}`                                            ; break;
    default      : display += `${record.label} ${record.display}`                                                   ; break;
  }

  this.stack_array.unshift([display, table.name, pk])  // add to first position of arra
  this.stack_list.choices_add(this.stack_array);       // display choices

  this.stack_record.table_set(this.db.getTable(table.name));  // set the model
  this.stack_record.show(pk);                                 // display record with pk
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
    const table_name = DOM.value;
    
    if (this.table_active.name === "") {
      // first table is selected, so add more options
      document.getElementById("table_operations").innerHTML += `
      <option value="merge"  >Merge</option>
      <option value="delete" >Delete</option>
      <option value="meta"   >Meta</option>
      `
    }
    this.table_active.name = DOM.value;  // remember active table - (safari does not suport style="display:none;" on optons tag, )

    this.db.get_table_names().forEach((table, i) => {
      document.getElementById(table).style.display = "none";  // records
    })

    this.sfc_db_tables.show(table_name);                              // hide all tables but table_name
    this.record_selected = document.getElementById(table_name)
    this.record_selected.style.display = "block";      // show record
    
    this.show("tables"   );  // show the tables section
    this.show("records"  );  // show record section
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


relation_edit( // client side relation_class
  ) {
    if (0 === this.stack_record.shadow_by_id("body").innerHTML.length) {
      this.relation_record.hidden = true;
      return; // there is nothing in the stack, so nothing to do;
    }

    if (0 === this.record_selected.shadow_by_id("body").innerHTML.length) {
      this.relation_record.hidden = true;
      return; // there is no record selected
    }

    const  table_1 = this.record_selected.table.name; // from selected record 
    const  pk_1    = this.record_selected.get_pk();   

    const table_2 = this.stack_record.table.name ;  // from stack_record
    const pk_2    = this.stack_record.get_pk();
  
    // return pk for relation, or undefine if does not exist
    this.pk = undefined;
    const index = this.sfc_record_relations.index;
    if (index[table_1] && index[table_1][pk_1] && index[table_1][pk_1][table_2]) {
      this.pk =  index[table_1][pk_1][table_2][pk_2]; // may still be undefined
    }
  
    // will be relation pk or undefined
    this.relation_record.hidden = false;
    this.relation_record.set_pk(this.pk);
    this.relation_record.edit();
  
    if (this.pk === undefined) {
      // add table1 and table 2 values, so new relation can be saved
      this.relation_record.shadow_by_id("pk_1"   ).value = pk_1 ;  
      this.relation_record.shadow_by_id("table_1").value = table_1;
  
      this.relation_record.shadow_by_id("pk_2"   ).value =  pk_2;
      this.relation_record.shadow_by_id("table_2").value =  table_2
    }
  }

}

export {dbUXClass};

app.spa = new dbUXClass();  
await app.spa.main(app.urlParams.get('url'));