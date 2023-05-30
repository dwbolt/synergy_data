class statementsClass {  // statementsClass.js
/*
user can choose to display
Profit & Loss
Balance Sheet
*/

// statementClass
constructor() {
  this.JournalTable;                       // pointer journal table;
  this.accounts;                           // will hold groupby accounts once data is loaded
  // setup data model for area 1 - income for income statement, assests for balance sheet
  this.t_area1   = new tableClass();     // asset table

  // setup viewer for area 1
  this.tux_area1 = new tableUxClass("area1", "app.page.tux_area1");
  this.tux_area1.model = this.t_area1;
  this.tux_area1.setSearchVisible(false);                 // hide search
  this.tux_area1.setLineNumberVisible(false);             // hide row line numbers
  this.tux_area1.setRowNumberVisible(false);
  this.tux_area1.setStatusLineData( []);  // ,"tableName","rows","rows/page","download","tags"

  // setup data model for area 2 - expense for income statement, liability for balance sheet
  this.t_area2   = new tableClass();     // liability table

  // set up viewr for area 2 -
  this.tux_area2 = new tableUxClass("area2", "app.page.tux_area2");
  this.tux_area2.model = this.t_area2;             // link data model with viewer
  this.tux_area2.setSearchVisible(false);          // hide search
  this.tux_area2.setLineNumberVisible(false);      // hide line numbers
  this.tux_area2.setRowNumberVisible(false);       // hide row numbers
  this.tux_area2.setStatusLineData( []);           // ,"tableName","rows","rows/page","download","tags"
}


// statementClass - client side
main(){
  this.accounts  = app.pages.loadYear.accounts.groups;  // hold groupby
  this.menu();
}


// statementClass - client side
menu() {
  this.JournalTable  = app.db.getTable('journal');
  app.menuAdd(`
<p><b>Statements</b></p>
<select size=4 onchange="app.pages.statements.displayStatement(this)">
<option value="pl"     >Profit</option>
<option value="balance">Balance Sheet</option>
</select>
`
  );
}


// statementClass - client side
// when users selects from statements menu
displayStatement(e) {
  switch (e.value) {
    case "balance":
      this.balanceSheet();
      break;
    case "pl":
      this.profitLoss();
      break;
    default:
      alert(`statementsClass.displayStatement - error e.value=${e.value}`)
  }
}


// statementClass - client side
profitLoss() {
  document.getElementById('title').innerHTML = "Profit and Loss";

  const income  = this.display("Income" ,"area1", "i-");   // fill in area1 - with income total by account
  const expense = this.display("Expense","area2", "e-");   // fill in area2 - expense totals by account

  // fill in area3 - net profit/loss
  document.getElementById("area3").innerHTML = `Net: ${app.format.money(income + expense)}`

  // now show the results
  document.getElementById("statement").style.display = "";
}


// statementClass - client side
balanceSheet() {
  document.getElementById('title').innerHTML = "Balance Sheet";

  const assets    = this.display( "Assets"  ,"area1", "a-");   // fill in area1 - with assets total by account
  const liability = this.display( "Liabilty","area2", "l-");   // fill in area2 - liabilty totals by account

  // fill in area3 - net
  document.getElementById("area3").innerHTML = `Net: ${app.format.money(assets + liability)}`

  // now show the results
  document.getElementById("statement").style.display = "";
}


// statementClass - client side
display(        // create table from group and display
  header        // ie "Assets" or "Liabilty"
  ,group        // "area1" or "area2" or "area3" object to create table from
  ,accountType  // "i-" -> income
) {
  let total = 0;                         // total of all records
  let totalRows = [];

  const tux     = this[`tux_${group}`]   // get tableUx
  const t       = tux.model;             // t points to table
  t.clearRows();                         // empty table

  // create table data from group
  Object.keys(this.accounts).forEach((attributeName, i) => {
    if (accountType === attributeName.slice(0,2)) {
      t.json.rows.push( [  `${attributeName}`,this.accounts[attributeName].aggObj.total] );
      total += this.accounts[attributeName].aggObj.total;
      totalRows = totalRows.concat( this.accounts[attributeName].rowIndex ); // create list with all rows
    }
  });

  // add Total attribute so clicking on Total will give all records
  this.accounts["Total "+accountType] = {"aggObj": {"total": total}, "rowIndex": totalRows}

  // now  display the table
  t.json.header = ["account","total"];
  tux.setColumnFormat(   1, `align='right'  onclick='app.pages.statements.displayDetail(this)'`);
  tux.setColumnTransform(1, app.format.money);
  tux.setFooter(  [["Total "+accountType  ,"${total()}"]] );
  tux.display();
  document.getElementById(`${group}H`).innerHTML = header;
  return total;
}


// statementClass - client side
displayDetail( // display the rows that were used to create
  dom // element user clicked ont
) {
  app.tableUx.journal.paging.row   =  0;   // if next button was hit,
  const account = dom.parentElement.children[0].textContent;
  const list =  this.accounts[account].rowIndex;
  app.tableUx.journal.display(list);  // set list as a tag
}

} ///////////// end of class

export {statementsClass}