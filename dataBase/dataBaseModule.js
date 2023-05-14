
import { dbClass}      from '/_lib/db/dbModule.js'     ;
import { tableUxClass} from '/_lib/UX/tableUxModule.js';


class dataBaseClass { 

constructor( // client side dataBaseClass
    dir    // user directory that database is in
   ,DOMid  // 
){  
    this.dir     = dir  ;   // directory in user space that po
    this.DOMid   = DOMid;   // where on the page the database interacts with the use

    app.dataBase  = this;   // get access to instance by app.contacts;


    this.db      = new dbClass(     "tableUX","app.database.tableUx");
    this.tableUx = new tableUxClass("tableUX","app.database.tableUx");
}


async main(){ // client side dataBaseClass
    document.getElementById("footer").innerHTML = ""  ;   // get rid of footer
    // hard code database to load
    await this.db.load("http://synergyalpha.sfcknox.org/users/dataBase/matthew/_db.json");
    // display table menu
    this.db.displayMenu(this.DOMid,""); // add onclick code
}


/*prefix # with methods that are private
#private(){  
    alert("private");
}
*/

}

export {dataBaseClass};


new dataBaseClass("dataBase","dataBaseDOM");
app.dataBase.main();