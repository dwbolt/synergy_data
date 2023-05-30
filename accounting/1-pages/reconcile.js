class reconcileClass {
/*

reconcile.js

class to help reoncile staments like banking, creadit card, etc with the books.

Beginning and ending balances for a statement are entered into the data base.  We then calculate the the same values from the journal and display the differences.
clicking on totals and get all the detail that went into that total

*/


// reconcileClass
constructor() {
  this.accounts;                           // will hold groupby accounts once data is loaded
  this.a_credits;
  this.a_debits;
}


// reconcileClass
main(){ // executed from meun system
  this.accounts  = app.pages.loadYear.accounts.groups;  // hold groupby
  this.t_b       = app.db.getTable('balance');    // short cut pointer to the table that contains the starting andending balance, total debits and total credits for each statement
  this.t_bField  = this.t_b.json.field;           // short cut to fields
  this.t_bRows   = this.t_b.json.rows;            // short cut to rows

  this.buildAccountList();
}


// reconcileClass
// fill in dropdown with accounts we have statements for
buildAccountList() {
  let html =
`
<b>Account</b><br>
<select id="account" size=4 onchange="app.pages.reconcile.updateStatementEnd()">
`

  const a_unique = this.t_b.unique('s_account');
  a_unique.forEach((account, i) => {
    html += `<option value="${account}">${account}</option>`
  });
  html += "</select>"
  app.menuAdd(html);
  // now waiting for user to select account
}


// reconcileClass
updateStatementEnd(){  // fill in dropdown with the endates for selected account
  const es = document.getElementById("statementEnd");
  const e = document.getElementById('account');
  const account = e.options[e.selectedIndex].value;

  const a_endDates = this.t_b.select((f,r)=> {
    return ( r[f.s_account]===account );
  });

  if ( es === null) {
    // menu does not exist yet, create it
    this.addStatementEndMenu(a_endDates,account);
    return;
  }

  // already there, replace the Data
  let html = "";

  a_endDates.forEach((rowIndex, i) => {
    let v = this.t_bRows[rowIndex][ this.t_bField["sd_statement"] ]
    html += `<option value="${v}">${v}</option>`
  });

  es.innerHTML =  html;   // wait on user to select statement to reconsile - will call app.pages.reconcile.reconcile()
}

addStatementEndMenu(a_endDates, account) {
  let html =  `<td>
  <b>Statement End</b><br>
  <select id="statementEnd" size=4 onchange="app.pages.reconcile.reconcile()">
  `
  a_endDates.forEach((rowIndex, i) => {
    let v = this.t_bRows[rowIndex][ this.t_bField["sd_statement"] ]
    html += `<option value="${v}">${v}</option>`
  });

  html += "</select></td>";
  app.menuAdd(html);
}


// reconcileClass
// clicking on the cell that contains any of the journal totals will
// run this, and display all the detail in the totals
displayDetail(list) {
  app.tableUx.journal.paging.row   =  0;   // if next button was hit,
  app.tableUx.journal.display(list);  // set list as a tag
}


// reconcileClass
// runs when user selects statement end date
reconcile() {
  // get account name from drop down
  let e = document.getElementById('account');
  const s_account    =  e.options[e.selectedIndex].value ;

  // get statement date from drop down
  e = document.getElementById('statementEnd');
  const sd_statement =  e.options[e.selectedIndex].value;

  // select row from balance table that matches account and staement End Date
  let i = this.t_b.select( (f,r)=>{
    return (s_account === r[f.s_account]  && sd_statement === r[f.sd_statement])
  })[0]; // assume only one row is returned, we have a data error if that is not true

  ///////// display stored data on statement begining, debit, credit,  ending
  const sr = this.t_bRows[i];  // statement record that we are reconciling
  let f = this.t_bField;

  document.getElementById('statement').innerHTML  =
  `<h2>Reconile Account: <b>${sr[ f.s_account ]}</b>&nbsp &nbsp Date: <b><a href="${sr[f.su_url]}" target="_blank">${sr[ f.sd_statement ]}</a></b></h2>`

  let balanceStart = sr[ f.n_start ];
  document.getElementById('balanceStart').innerHTML = app.format.money(balanceStart);

  let credits = sr[ f.n_credit ];
  document.getElementById('credits').innerHTML      = app.format.money(credits);

  let debits = sr[ f.n_debit ];
  document.getElementById('debits').innerHTML       = app.format.money(debits);

  let balanceEnd = sr[ f.n_end ];
  document.getElementById('balanceEnd').innerHTML   = app.format.money(balanceEnd);

  //////// calculate joural data
  const t = app.db.json['journal'];  // t points to joural table
  this.a_credits      = [];         // list of all transactions that cleared on the slected stament that we are reconciling
  this.a_debits       = [];         // list of all transactions that cleared on the slected stament that we are reconciling
  this.a_transactions = [];        // list of all transactions for the year that cleared on the slected stament that we are reconciling

  let creditsJ = 0;
  let debitsJ  = 0;
  let balanceEndJ  = 0;
  // walk all transactions for selected account
  this.accounts[s_account].rowIndex.forEach((rowIndex, i) => {
    let statement = t.getValue(rowIndex,"sd_statement");
    let credit = t.getValue(rowIndex,"n_credit");
    let debit  = t.getValue(rowIndex,"n_debit");
    if ( statement === sd_statement) {
      // transaction is on statement we are reconcileing
      if ( 0 < credit) {this.a_credits.push(rowIndex);  creditsJ += credit}
      if ( 0 < debit ) {this.a_debits.push( rowIndex);  debitsJ  += debit}

      balanceEndJ += credit - debit;
      this.a_transactions.push(rowIndex);
    } else if (statement < sd_statement) {
      // transaction is on prior statement
      balanceEndJ += credit - debit;
      this.a_transactions.push(rowIndex);
    }
  });

  //////// display joural data
  document.getElementById('creditsJ'   ).innerHTML    = app.format.money(creditsJ);
  document.getElementById('creditsDiff').innerHTML    = app.format.money(credits - creditsJ);

  document.getElementById('debitsJ'   ).innerHTML     = app.format.money(debitsJ);
  document.getElementById('debitsDiff').innerHTML     = app.format.money(debits - debitsJ);

  document.getElementById('balanceEndJ'   ).innerHTML = app.format.money(balanceEndJ);
  document.getElementById('balanceEndDiff').innerHTML = app.format.money(balanceEnd - balanceEndJ);
}


} ///////////// end of class

export {reconcileClass}