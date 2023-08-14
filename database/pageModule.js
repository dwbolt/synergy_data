import { csvClass    } from '/_lib/db/csvModule.js'       ;
import { dbClass     } from '/_lib/db/dbModule.js'        ;
import { tableUxClass} from '/_lib/UX/tableUxModule.js'   ;
import { menuClass   } from '/_lib/UX/menuModule.js'      ;


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
    this.menu     = new menuClass("menu_page");
    this.tableUX  = new tableUxClass("tableUXDOM","app.page.tableUX");
    this.tableUX.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download","groupBy"]);
    this.tableUX.setRowNumberVisible(false);

    
    this.tableUXRelations  = new tableUxClass("tableUXRelations","app.page.tableUXRelations");
    this.tableUXRelations.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page","download","groupBy"]);
    this.tableUXRelations.setRowNumberVisible(false);
  }


async main(){ // client side dbUXClass - for a page
  // user opened database app
  // make sure user is logged in
  if (! await app.login.getStatus()) {
      alert("please log before using the database")
      window.location.replace("app.html?p=logInOut");
  }

  // load list of databases available
  let obj;
  do {
    obj  = await app.proxy.getJSONwithError(this.#url);   // get list of databases
    if(obj.json === null) {
      alert("missing or bad database/_.json, replacing with test file");
      // missing or ill formed json file, so store an empty good one 
      await app.proxy.RESTpost(
        `{
          "meta":{
            "databases": {"personal"   : {"location":"personal"}}
            }
        }`
        ,this.#url)
    }
  } while (obj.json === null);  // repeat until we load a database

  this.#json_db  = obj.json;   // get list of databases
  document.getElementById("footer").innerHTML = ""    ;   // get rid of footer

  // build database menu
  const db       = this.#json_db.meta.databases;          
  const dbkey    = Object.keys(db);
  let html = `<select size="4" onclick="app.page.database_select(this)">`;
  // build list of databases to choose
  for(let i=0; i<dbkey.length; i++ ) {
    html += `<option value="${dbkey[i]}">${dbkey[i]}</option>`;
  }
  html += "</select>"

  // display menu
  this.menu.add(`
    <td>
    <a onclick="app.page.database_dialog()">Databases</a><br>
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
  await this.db.load(`${this.#url_dir}/${dom.value}/_.json`);   // load the database

  // display table menu
  this.menu.deleteTo(1);   // remove menues to the right of database memnu
  this.menu.add(`
  <td>
  <a onclick='app.page.table_dialog()'>Tables</a><br>
  <div id='menu_page_table'></div>
  </td>
  `);
  this.db.displayMenu("menu_page_table","app.page.display_tables(this)"); // display tables in database


  // create relation index
  this.relation_creat_index();
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
  <select size="4" onclick="app.page.database_dialog_process(this)">
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
  <select size="4" onclick="app.page.table_dialog_process(this)">
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
        <input type='file' accept='.csv' onchange='app.page.loadLocalCSV(this)'><br>
        <textarea id='msg'></textarea>
        </p>`;
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
  DOM) { 
    // user clicked on table, so show it.
    this.tableUX.setColumnFormat(   0, 'onclick="app.page.recordShow(this)"');  // assume primary key is 0 -  needs to be done in code
    this.tableUX.setColumnTransform(0, app.page.displayIndex                );  // style it like a hyper link so it will get clicked on.
    this.tableUX.setModel(this.db,  DOM.value                               );  // attach data to viewer
    const table = this.tableUX.getModel();
    this.tableUX.display(table.PK_get()                                     );   // display table
    this.buttonsShow("New")
}



display_relations(   // client side dbUXClass
  ) {   
    // user clicked on table, so show it.
   // this.tableUXRelations.setColumnFormat(   0, 'onclick="app.page.recordShow(this)"');  // assume primary key is 0 -  needs to be done in code
    this.tableUXRelations.setColumnTransform(0, app.page.displayIndex                );  // style it like a hyper link so it will get clicked on.
    this.tableUXRelations.setModel(this.db,  "relations"                             );  // attach data to viewer
    const table = this.tableUXRelations.getModel();
    // get list of relations from relation_index
    let array = this.relation_index[this.tableUX.tableName][this.#primary_key_value];
    if(!array) {
      // convert undevined to empty array
      array = [];
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
    
    const fr = new FileReader();
    fr.onload =  () => {
      // call back function when file has finished loading
      let name      = element.files[0].name;
      name          = name.slice(0, name.length -4);                    // get rid of .csv in table name
      const table   = this.db.tableAdd(name);                           // create table and add to db
      const csv     = new csvClass(table);                              // create instace of CSV object
      csv.parseCSV(fr.result, "msg");                                   // parse loaded CSV file and put into table
      this.db.displayMenu("menu_page_table","app.page.display_tables(this)"); // display tables in database
    };
    fr.readAsText( element.files[0] ); // will only read first file selected
}


async saveDB( // client side dbUXClass - for a page
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}


recordShow(  // client side dbUXClass - for a page
  element // dom element
){
  // recordShow
  const table             = this.tableUX.getModel()  // get tableClass being displayed
  let html = `Table: ${this.tableUX.tableName}<br><table>`;
  if (element) {
    // user clicked on elemnt, remember primary key for other record methodes
    this.#primary_key_value = parseInt(element.innerText,10); 
  }
  const  row = table.PK_get(this.#primary_key_value); 
  const  header = table.getHeader();
  let rowValue,location;
  for(var i=0; i<header.length; i++) {
    location = table.get_field(i,"location");

    switch(location) {
      case "row":
        rowValue = row[i];
        break;
      case "column":
        rowValue = table.get_column(this.#primary_key_value,i);
        break;
      case "multi":
        rowValue = "";
        let multi = table.get_multi(this.#primary_key_value, i);
        for(let ii=0; ii<multi.length; ii++){
          rowValue += `${multi[ii][0]}:${multi[ii][1]} - ${multi[ii][2]} <br>`;
        }
        break;
      default:
        // error
        alert(`error class="dbUXClass" method="recordShow"`);
    }

    if (typeof(rowValue) === "undefined") {
      rowValue = "";
    }
    html += `<tr><td>${i+1}</td> <td>${header[i]}</td> <td>${rowValue}</td></tr>`
  }
  html += "</table>"
  document.getElementById("record").innerHTML = html;

  // show buttons
  this.buttonsShow("New Duplicate Edit  Delete Cancel");

  // show relations
  // need to set filters to only things connected to record
  this.display_relations("tableUXRelations");
}


recordEdit(  // client side dbUXClass
  edit_type // true -> edit table record    false -> edit buffer record
){// client side dbUXClass - for a page
  this.#edit_type = edit_type;
  let html = "<table>";
  const table  = this.tableUX.getModel();  // get tableClass being displayed
  const row    = (this.#edit_type ? 
    table.PK_get(this.#primary_key_value) :
    table.bufferGet(0));  // hard code for one record case 
  const header = table.getHeader();
  let multi_value,location,type;
  for(var i=0; i<header.length; i++) {
    location = table.get_field(i,"location");
    type     = table.get_field(i,"type");
    if (type === "PK") {
      // do not allow editing of primary key
      html += `<tr><td>${header[i]}</td> <td>${row[table.get_field(i,"param")]}</td></tr>`
      this.#primary_key_value = row[i];
    } else {
      let value;  
      switch(location) {
        case "multi":
          // multi value
          let multi = table.get_multi(this.#primary_key_value, i);
          html += `<tr><td>${header[i]}</td> <td>`;
          for(let ii=0; ii<multi.length; ii++){
            html += 
            `<input id='edit-${type}-label-${ii}'   type='text' value='${multi[ii][0]}'></input>
            <input id='edit-${type}-value-${ii}'   type='text' value='${multi[ii][1]}'></input>
            <input id='edit-${type}-comment-${ii}' type='text' value='${multi[ii][2]}'></input><br>
            `
          }
          html += "</td></tr>";
          break;
        case "row":
          // single value
          value = row[table.get_field(i,"param")];
          if (typeof(value) === "undefined") {
            value="";  // assume string, code neeed to init default type.
          }
          html += `<tr><td>${header[i]}</td> <td><input id='edit-${i}' type='text' value='${value}'></td></tr>`
          break;
        case "column":
          // single value
          value = table.get_column(this.#primary_key_value,i);
          html += `<tr><td>${header[i]}</td> <td><input id='edit-${i}' type='text' value='${value}'></td></tr>`
          break;
        default:
          // 
      }
      
    }
  }
  html += "</table>";
  document.getElementById("record").innerHTML = html;
  this.buttonsShow("Save Cancel");
}


recordSave(){  // client side dbUXClass - for a page
  // save to memory
  const table     = this.tableUX.getModel();  // get tableClass being displayed
  const row       = table.PK_get(this.#primary_key_value);    
  const rowEdited = [];

  // fill rowEdited with values from edit form
  const header = table.getHeader();
  for(var i=0; i<header.length; i++)  {
    // walk the form 
    let location = table.get_field(i,"location");   
    if (typeof(location) === "number") {
      // single value
      let edit = document.getElementById(`edit-${i}`);
      if (edit) {
        // value input
        rowEdited[i] = edit.value;
      }
    } else {
      // multi value
      let type     = table.get_field(i,"type"); // PK, string, number, phone, url
      rowEdited[i] = [];                        // start empty, build from form
      let ii=0;
      let label = document.getElementById(`edit-${type}-label-${0}`);
      while (label) {
        let value   = document.getElementById(`edit-${type}-value-${ii}`  );
        let comment = document.getElementById(`edit-${type}-comment-${ii}`);
        rowEdited[i].push([label.value, value.value, comment.value]);
        ii++;
        label = document.getElementById(`edit-${type}-label-${ii}`  );
      }
    }
  }

  table.save2memory(this.#primary_key_value, rowEdited);
  this.show_changes();
  this.recordShow();
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
  this.tableUX.display(table.PK_get() );  // redisplay data
  this.show_changes();                    // show changes
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
  //alert("recordDelete from memery, not implemented yet")
  //return;
  const table = this.tableUX.getModel();  // get tableClass being displayed
  table.delete(this.#primary_key_value);  // delete row from data
  this.tableUX.display(table.PK_get() );  // redisplay data
  this.recordCancel();                    // hide record form
  this.show_changes();                    // show changes
}


}

export {dbUXClass};


app.page = new dbUXClass("/users/database","databaseDOM","tableDOM");  // access loggin users databases
app.page.main();