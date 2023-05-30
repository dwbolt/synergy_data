// accounting
import { dbClass     } from '/_lib/db/dbModule.js'      ;
import { tableClass  } from '/_lib/db/tableModule.js'   ;
import { csvClass    } from '/_lib/db/csvModule.js'     ;
import { groupbyClass} from '/_lib/db/groupbyClass.js'  ;

import { tableUxClass} from '/_lib/UX/tableUxModule.js' ;
import { proxyClass  } from '/_lib/proxy/proxyModule.js';

import { reconcileClass  } from '/synergyData/accounting/1-pages/reconcile.js';
import { statementsClass } from '/synergyData/accounting/1-pages/statements.js';

import { dataClass       } from '/synergyData/accounting/1-pages/data.js';
import { homeClass       } from '/synergyData/accounting/1-pages/home.js';


/*

import { loadyearClass   } from '/synergyData/accounting/1-pages/loadyear.js';

<script type="text/javascript" src="\_lib\UX\loginClass.js"></script>
<script type="text/javascript" src="\_lib\format\formatClass.js"></script>
*/


class accountingClass { // client side dbUXClass - for a page

  #DOMid

constructor( // client side dbUXClass - for a page
   DOMid  
){  
  debugger;
  this.#DOMid   = DOMid;

  this.proxy    = new proxyClass(); // async load server files, json and html fragments
  this.db       = new dbClass();    // contains journal, chart of accounts, and ending statement balance for accounts that need reconsiliation
  this.format   = new formatClass();
  this.login    = new loginClass();
  
  this.tableUx  = {}
  this.tableUx.balance   = new tableUxClass("details" ,"app.tableUx.balance"  );
  this.tableUx.accounts  = new tableUxClass("details" ,"app.tableUx.accounts" );
  this.tableUx.journal   = new tableUxClass("details" ,"app.tableUx.journal"  );

  // create the buffer displays
  this.tableUx.balanceB  = new tableUxClass("detailsB","app.tableUx.balanceB" );
  this.tableUx.accountsB = new tableUxClass("detailsB","app.tableUx.accountsB");
  this.tableUx.journalB  = new tableUxClass("detailsB","app.tableUx.journalB" );

  this.tableUx.balanceB.buffer  = true;  // will be displaying and editing Buffer
  this.tableUx.accountsB.buffer = true;
  this.tableUx.journalB.buffer  = true;

  this.page;               // set to value of loaded page, it page = app.pages.loadYear is loadYear page is active.
  this.pages = {};
  //this.pages.loadYear   = new loadYearClass();
  this.pages.reconcile  = new reconcileClass();
  this.pages.statements = new statementsClass();
  this.pages.data       = new dataClass();
  this.pages.home       = new homeClass();
}


async main(){ // client side dbUXClass - for a page
    document.getElementById("footer").innerHTML        = ""  ;   // get rid of footer
    document.getElementById("accountingDOM").innerHTML = "" 
    //await this.db.load(this.#url);                        // load the database
    // display table menu
    //this.db.displayMenu(this.#DOMid,"app.page.display(this)"); // add onclick code
}

}

export {accountingClass};

app.page = new accountingClass("accountingDOM");  // hardcode database for now, later support multiple databases per user
app.page.main();