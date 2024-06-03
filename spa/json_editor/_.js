/* jsonEditor cocer */

import  {formatClass} from '/_lib/format/format_module.js';
import  {proxyClass}  from '/_lib/proxy/proxy_module.js';
import  {loginClass}  from '/_lib/UX/login_module.js';
import  {menuClass}   from '/_lib/UX/menu_module.js';

class json_edit_class {  // json_edit_class - clientside
/*

JSON editor

attributes
  delete 
  add
  edit
    string
    number
    boolean
    array
    object
  save (append) change log
  merege - archive old json and change log, create new json with all changes incorprated.
  

do I want to support all the database type
  date
  date-time
  money ....

*/

constructor() {  // json_edit_class - clientside
  this.json    = {}; // data we are view/edit
  this.changes = ""; // list of changes since last save
  this.proxy   = new proxyClass(); // async load server files, json and html fragments
  this.format  = new formatClass();
  this.login   = new loginClass();
  this.menu    = new menuClass("menu");
  this.changeLog = {};  // will contain change long, one
}

main() {  // json_edit_class - clientside
  document.getElementById("footer").innerHTML = ""          ;   // get rid of footer
  this.login.buildForm(`loginX`);
  this.login.loginTrue = app.loginTrue;  // set callback function

  // set path and name to default or get from URL
  const urlParams = new URLSearchParams( window.location.search );
  let param = urlParams.get('path');
  if ( param != null)  {
    // set path to one on url
    document.getElementById('path').value = param;
  }
  param = urlParams.get('name') ;
  if ( param != null)  {
    // set file name to one on url
    document.getElementById('name').value = param;
  }
}

attribute_add() { // json_edit_class - clientside
  const name = document.getElementById("attribute_name").value;
  const type = document.getElementById("attribute_type").value;

  this.statement("app.spa.json",`.${name}=${type}`); // redisplay, selected attibute should be added
}


attribute_delete(){ // json_edit_class - clientside
  // delete selecct attribute
  this.statement("delete app.spa.json","");
}


statement(stm_start,stm_end){ // json_edit_class - clientside
  // delete selecct attribute
  let statment = stm_start;
  for(var i=0; i<this.path.length; i++) {
    statment +=  `.${this.path[i]}`;
  }
  eval(statment+stm_end);      // do not like using eval, need to find another way
  this.displayDetail(); // redisplay, selected attibute should be deleted
}


loginTrue(){  // json_edit_class - clientside
  // show the load div
  document.getElementById('load').style.visibility = "visible";
}


async loadJSON(){ // json_edit_class - clientside
  this.menu.init();

  // load json file to view/edit
  this.path = document.getElementById('path').value;
  this.name = document.getElementById('name').value;

  let jsonURL = this.path + this.name;
  document.getElementById("jsonURL").innerHTML = "Editing File: " + jsonURL;
  this.json = await this.proxy.getJSON(jsonURL);
  this.displayDetail();
  document.getElementById('edit').style.visibility = "visible";  // show edit section of page
}


async save2Memory( // json_edit_class - clientside
){ // save change to memory and append changeLog

  // build path to selected object
  const childNodes = document.getElementById("menu").childNodes;  // should be <td> of <tr>
  let path="",value;
  for (var i = 0; i < childNodes.length; i++) {
     value = childNodes[i].lastChild.value; // should be <selected>
     path += `.${value}`
  }

  // remember old and new values, update to new value
  let valueNew = document.getElementById('value').value;
  let valueOld = eval(`this.json${path}`);
                 eval(`this.json${path}=valueNew`);  // do not like eval, but do not know how to get arround lack of poitners.

  // create/update change log;
  let logEntry = this.changeLog[path];  // get change log entry
  if (logEntry) {
    // log entry exists
    if (logEntry.firstChange === "update" && logEntry.fileValue === valueNew) {
      // was changed back to original, so delete change log entry
      delete this.changeLog[path];
      return;
    }
  } else {
    // new change so add, "firstChange" - create, update, delete an attribute
    logEntry = {"path":path, "firstChange":"update", "fileValue":valueOld};
  }

  // update
  logEntry.date        = new Date();
  logEntry.valueOld    = valueOld ;
  logEntry.valueNew    = valueNew;
  this.changeLog[path] = logEntry;
  document.getElementById('save2Server').style.visibility = ( (Object.keys(this.changeLog).length === 0     ) ? 'hidden'  : 'visible');
  document.getElementById("changes").value = this.format.obj2string(this.changeLog);
}


async save2Server(// json_edit_class - clientside
){
  const obj = (document.getElementById('format').checked) ? this.format.obj2string(this.json) : JSON.stringify(this.json)
  // save updated object back to server
  const msg = {
  "server":"web"
  ,"msg":"uploadFile"
  ,"path":`${this.path}`
  ,"name":`${this.name}`
  ,"data":`${obj}`
  }

  const resp = await app.proxy.postJSON(JSON.stringify(msg));  // save
  alert(JSON.stringify(resp));   // was it succussful
  location.reload();
  this.windowActive = false;

  // need to upload change log;
  
}


dataChanged(element){
  alert(element.innerHTML);
  alert(element.value);
}

displayDetail(  // json_edit_class - clientside
  element  // DOM element clicked on
) {

  // save clicked attribute
  let obj = this.json;   // will be displayed in value
  this.path = [];  // remeber path to selected

  // delete menu past selection, narrow obj to one clicked on
  let childNodes = document.getElementById("menu").childNodes;  // will be <div>
  for (var i = 0; i < childNodes.length; i++) {
     let e = childNodes[i].lastChild // should be <selected>
     obj = obj[e.value];
     this.path.push(e.value);
     if (e === element) {
       // done - delete any remaining children
       this.menu.deleteTo(i+1);
     }
  }

  let html = `
  <input type="button" value="<" onclick="app.spa.previous(this)">
  <input type="text"   size="15" onkeyup="app.spa.searchAttriute(this)">
  <input type="button" value=">" onclick="app.spa.next(this)"><br>
  <select  size=6 onclick="app.spa.displayDetail(this)" style="width: 25ch">
  `;

  // build menu list with attribute name and type of value
  for (let key in obj) {
	  let value = obj[key];
	  if (obj.hasOwnProperty(key)) {
      let type = typeof(value);
      if (Array.isArray(value)) {
        type = `Array[${value.length}]`;
      } else if ("string" === type) {
        type = `string[${value.length}]`;
      } else if ("number" === type) {
        // let type=number;
        type = `number`;
      }

	    html += `<option value= "${key}"     >${key}:${type} </option>`;
	  }
	}

  // show/hide save buttons
  document.getElementById('save2Memory').style.visibility = ( (0 <= ["string","number"].indexOf(typeof(obj))) ? 'visible' : 'hidden' );
  document.getElementById('save2Server').style.visibility = ( (Object.keys(this.changeLog).length === 0     ) ? 'hidden'  : 'visible');

  // display selected attribute data in textarea
  if (typeof(obj) == "object") {
    document.getElementById("value").value         = JSON.stringify(        obj);
    document.getElementById("valueFormated").value = this.format.obj2string(obj);
    // add menu to select atributes
    this.menu.add(`${html}</select>`);
  } else {
    document.getElementById("value").value         = obj;
    document.getElementById("valueFormated").value = obj;
  }
}


searchAttriute(// json_edit_class - clientside
  input  // input element - called on keypress
){
  const sel       = input.parentElement.lastChild;  // should be select dom
  const searchFor = input.value;                    // search values in select

  for(let i=0; i< sel.length; i++) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match
      sel.value = sel[i].value; // select it
      app.spa.displayDetail(sel);   // display interval
      break; // we are done
    }
  }
}


previous(  // json_edit_class - clientside
button // button that was clicked
){
  const sel       = button.parentElement.lastChild;             // should be select dom
  const searchFor = button.parentElement.children[1].value;   // should be input text values in select

  for(let i=sel.selectedIndex-1; -1< i && i<sel.length ; i--) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match, select
      sel.value = sel[i].value;
      app.spa.displayDetail(sel);   // display interval
      break; // we are done
    }
  }
}


next(  // json_edit_class - clientside
  button // button that was clicked
  ){

  const sel       = button.parentElement.lastChild;             // should be select dom
  const searchFor = button.parentElement.children[1].value;   // should be input text values in select

  for(let i=sel.selectedIndex+1; i< sel.length; i++) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match, select
      sel.value = sel[i].value;
      app.spa.displayDetail(sel);   // display interval
      break; // we are done
    }
  }

}



} // json_edit_class - clientside  end


export { json_edit_class };
       
app.spa = new json_edit_class();
await app.spa.main(app.urlParams.get('url'));

