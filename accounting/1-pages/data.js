class dataClass {
/*

file: 2-web/apps/accounting/1-pages/data.js

allows user to CRUD
  journal data
  accounts - chart of
  balance - statement balances used to reconcile

*/


constructor() { // dataClass - client side
  this.books  = "";    // data directory
  this.year   = 0;     // index into dropdowns for year of data selected
  this.tableI = 2;     // index into dropdown, table being displayed defaut to journal

  this.table;          // is selected tableClass
  this.tableUx;        //ux for table being displayed
  this.tableUxB;      // ux for  buffer, view, edit, append

  this.searchList=null;    // null-> no search filter,  [] -> search filter saved
  this.userConfig;
}


async main() {  // dataClass - client side
  // starts the ball rolling, called from pageload
  this.createTableMenu();
}


// dataClass - client side
edit(){
  this.tableUx.model.table2buffer(this.tableUx.selected);  // copy selected rows to buffer
  this.tableUxB.display()  // display buffer
}


// dataClass - client side
duplicate(){
    alert("duplicate");
}


// dataClass - client side
createTableMenu() {
  app.menuAdd(`<div id="selectTable"></div>`);
  app.db.displayMenu(  'selectTable',"app.page.displayTable(this)"); // display menu of tables, user can select one to display

  // preselect default
  document.getElementById('selectTable').childNodes[1].selectedIndex = this.tableI
  app.page.displayTable();
}


// dataClass - client side
async saveYear() {
  // hide
  document.getElementById('loadYear').style.display     = "none";

  const s_file = app.db.save();
  const msg =
  `{
  "server":"web"
  ,"msg":"uploadFile"
  ,"dir":"${this.getURL()}"
  ,"data": "${app.format.escStringForJson(s_file)}"
  }`

  const resp = await app.proxy.postJSON(msg);
  alert(resp.message)
}


// dataClass - client side
displayTable() { // user clicked on a table
  // show/hide
  //document.getElementById("jsonDisplay").style.display = "none";  // hide jsonDisplay
  //document.getElementById("loadYear"   ).style.display = ""    ;  // unhide <div>

  // init tableUx
  const e     = document.getElementById('selectTable').childNodes[1]; // get value drop down list
  const table = e.options[e.selectedIndex].value;                     // get table name selected by user

  this.tableUx  = app.tableUx[table];
  this.tableUxB = app.tableUx[table+"B"];
  this.tableUx.display();  // display table

  // display buffer
  //app.tableUxB.createEmpty(5);
  //app.tableUxB.display();
  //this.tableUxBuffer.setModel()
  // display journal

}

// dataClass - client side

selectTransaction( // slect all rows with tranaction id of row clicked on
  element  // td that was clicked on
) {
  // get transaction id;
  const n_transaction = parseInt(element.innerHTML);  // for journal table

  // find and rows with that transaction number
  let a_index = this.tableUx.model.select((f, r) =>{
    return ( r[f.n_transaction] === n_transaction )
  });

  this.tableUx.setSelected(a_index);
  this.tableUx.display(a_index)  // display buffer
}



// dataClass - client side
// copy all rows with tranaction id of row clicked on
copyTransaction2Buffer(element) {
  // get transaction id;
  const n_transaction = parseInt(element.innerHTML);  // for journal table

  // find and rows with that transaction number
  let a_index = app.tableUx.model.select((f, r) =>{
    return ( r[f.n_transaction] === n_transaction )
  });

  //this.table.table2buffer(a_index);  table2buffer
  //this.table.bufferDisplay();        // display new buffer
  app.tableUx.model.table2buffer(a_index);  // copy selected rows to buffer
  this.tableUxBuffer.display()  // display buffer
}


// dataClass - client side
// copy data from dom to buffer json structure
bufferChange() {
  this.table.bufferInput2Json();
}


// dataClass - client side
searchBack(){
  this.displayTable();
}


// dataClass - client side
bufferCreateEmpty() {
  this.table.bufferCreateEmpty(5)
}


// dataClass - client side
bufferSave() {
  // makeSure Debits and Credits are equal
  this.table.bufferSave();        // apped buffer to tables
  this.bufferCreateEmpty();
  this.table.bufferDisplay();     // displa new tables

  if (this.searchList) {
    // if we edit from a search, stay there
    this.table.displayList(this.searchList);
  } else {
    this.table.display();
  }
}


// dataClass - client side
bufferAppend() {
  // add soom validation

  // calculate the next transaction number
  let n_t = this.table.json.rows.map( (r) => r[0]).reduce( (a,b) => Math.max(a,b)) + 1;

  // replace all the buffer tranaction number with a new tranaction number
  this.table.json.rowsBuffer.forEach((r, i) => {
    r[1][0]=n_t;
  });

  this.table.bufferAppend();    // apped buffer to tables
  this.bufferCreateEmpty();     // create new buffer
  this.table.bufferDisplay();   // display new empty buffer

  this.table.display();        // displa new table with appended data
}

// dataClass - client side
}  /////////////// end

export {dataClass}