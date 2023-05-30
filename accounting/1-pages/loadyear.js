
class loadYearClass {
/*

file: 2-web/apps/accounting/1-pages/loadYearClass.js

loads journal data

*/


// loadYearClass - client side
constructor() {
  this.year   = 0;     // index into dropdowns for year of data selected
  this.tableI = 2;     // index into dropdown, table being displayed defaut to journal
  this.books    = {name: null, year: null, url: null}  //

  this.table;          // is selected tableClass

  this.searchList=null;    // null-> no search filter,  [] -> search filter saved
  this.userConfig;
  this.accounts = new groupByClass();
}


// loadYearClass - client side
// code depends on None being the first option
async main() {
  // get users accounting configuration
  this.userConfig = await app.proxy.getJSON("/users/accounting/_.json");

  // create drop down option to select set of books to work on
  let options="";
  Object.entries(this.userConfig.books).forEach((item, i) => {
    options += `<option value="${item[1].user}">${item[0]}</option>`
  });

  // create menu
  const menu  = `
<p><b>Select Books to load</b><br>
<select id="Books" size=4 onchange="app.page.setBooks()">
<option value="">None</option>
` + options + `
</select>
</p>
`
  app.menuAdd(menu);
}


// loadYearClass - client side
setBooks() {
  // users just slected a set of books. eg personal, SFC, etc
  // save what they selected
  var select = document.getElementById('Books');
  this.books.name = select.options[select.selectedIndex].value;
  app.menuDeleteTo(2);

  // create drop down option to select set year to work on
  let options="";
  this.userConfig.books[this.books.name].years.forEach((item, i) => {
    options += `<option value="${item}">${item}</option>`
  });

  // create menu
  const menu  = `
<p><b>Select year to load</b><br>
<select id="Year" size=4 onchange="app.page.loadYear()">
<option value="0">None</option>
` + options + `
</select>
</p>
`
  // add menu to allow to choose year
  app.menuAdd(menu);
  if (0 < this.year) {
    // data is already loaded, select year
    document.getElementById('Year').selectedIndex = this.year;

    // now load next menue
    this.createTableMenu();
  }
}


async loadYear() {  // loadYearClass - client side
  // user just selected the year of data they want to load
  const tablesURL  = this.getURL();

  if (0 < this.year) {
    // load sele// loadYearClass - client sidected year data
    await this.initTableUx(tablesURL);
  } else {
    // clear data by reloading page
    app.loadPage();
  }
  app.menu(); // update app menu to to show/hide menu selections that depend on data being loaded
}


async initTableUx( // loadYearClass - client side
  tablesURL        //
  ) {
  await app.db.load(tablesURL);

  document.getElementById("books").innerHTML = `Books:${this.books.name} &nbsp Year:${this.books.year} &nbsp Journal entries: ${app.db.getTable("journal").json.rows.length}`

  // walk journal and create account lists
  this.createAccountLists();

  let t;  // table

  // set up to view balances
  t = app.tableUx.balance;
  t.paging.lines =20;
  t.setModel(app.db,"balance");
  t.setColumnTransform(2,app.format.money);
  t.setColumnTransform(3,app.format.money);
  t.setColumnTransform(4,app.format.money);
  t.setColumnTransform(5,app.format.money);

  // set up to view accounts
  t   = app.tableUx.accounts;
  t.paging.lines =20;
  t.setModel(app.db,"accounts");


  // set up viewer for journal tux_detail
  t = app.tableUx.journal;
  t.setBuffer(app.tableUx.journalB); // buffer tableUX with main tableUx
  t.paging.lines =20
  t.setModel(app.db,"journal");
  t.setColumnTransform(6,app.format.money);
  t.setColumnTransform(7,app.format.money);
  t.setFooter(  [["","","","","","<b>Total</b>"  ,"${total()}","${total()}","","",""]] );
  t.setStatusLineData(["tableName","nextPrev","rows","firstLast","tags","rows/page"
    ,`<input type="button" id="edit"      onClick="app.page.edit()" value="Edit" />`
    ,`<input type="button" id="duplicate" onClick="app.page.duplicate()" value="Duplicate" />`
    ]);
  t.setColumnFormat(t.f("n_transaction"), 'onclick="app.page.selectTransaction(this)"');
}

// loadYearClass - client side
getURL(){
  const e   = document.getElementById('Year');
  this.year = e.selectedIndex; // remember year that is selected is

  this.books.year  = e.options[e.selectedIndex].value;
  this.books.url = `/users/accounting/${this.books.name}/${this.books.year}/tables.json`;
  return this.books.url;
}


// loadYearClass - client side
createAccountLists() {
  const table = app.db.getTable("journal");
  this.accounts.groupBy(table, ['s_account']);

  this.accounts.aggregate( (state, o, row) => {
    switch (state) {
      case "init":
        o.total = 0;
        break;
      case "agg":
        o.total += row[table.f("n_debit")] - row[table.f("n_credit")] ;
        break;
      case "finish":
        break;
      default:
        alert(`loadYearClass.createAccountLists() error state=${state}`);
    }
  });
}


// loadYearClass - client side
}  /////////////// end

export {loadYearClass}
