import {recordUxClass} from '/_lib/db/recordUx_module.js';

class stack_class {

/*

manage record stack for database spa
display record on stack
list of records on stack that user can click on to diaplsy
menu of operations for user to apply to record displayed or entire stack (clear all, remove, up, down, top, bottom)

*/

constructor( // client side stack_class - for a spa
){
  this.stack = [];   // top of the stack is highest number, so display in reverse order,  contains obects of the form {name:"", name_talbe:"", pk:""}

  /////
  this.stack_record;             // ux to display stack record,

  this.stack_record = new recordUxClass()                   ;   // create ux for create/edit relations
  this.stack_record.globalName_set("app.spa.stack_record"  );   // this is a seprate from record associated with this.tableUX.relation
  this.stack_record.dom_ids_set(   "stack_record"          );   // override default dom locations
  this.stack_record.html_create(                           );   // create 
}


push( // client side stack_class - for a spa
){
  const table_name = app.spa.table_active.name;
  const pk         = app.spa.tableUX[table_name].recordUX.get_pk();
  const obj        = {"name_table": table_name, "pk": pk};
  const record     = app.spa.tableUX[table_name].getModel().get_object(pk); 
  
  let name = table_name + " : " ;

  switch (table_name) {
    case "people": name += `${record.name_last}, ${record.name_first}`                                           ; break;
    case "phones": name += `${record.label} ${record.country_code} (${record.area_code}) ${record.phone_number}` ; break;
    case "groups": name += `${record.name_short} ${record.name_full}`                                            ; break;

    default      : name +=  `${record.label} ${record.display}`                                                  ; break;
  }

  obj.name = name;
  this.stack.push(obj);
  this.display(this.stack.length-1);
}


display(  // client side stack_class - for a spa
  index  // of relation to display
) {
  // display record
  let obj = this.stack[index];                                      // get record info form stack
  this.stack_record.table = app.spa.db.tables[obj.name_table]  // set model for record
  this.stack_record.show(obj.pk);                                   // display the record

  // display stack
  this.stack_display()

  // create stack buttons if they do not exist
  if (0 === document.getElementById("stack_buttons").innerHTML.length) {
    document.getElementById("stack_buttons").innerHTML =`
    <input type="button" value="top"    hidden="true" onclick="app.spa.stack.top()"><br>
    <input type="button" value="bottom" hidden="true" onclick="app.spa.stack.bottom()"><br>
    <input type="button" value="up"     hidden="true" onclick="app.spa.stack.up()"><br>
    <input type="button" value="down"   hidden="true" onclick="app.spa.stack.down()"><br><br>
    <input type="button" value="remove" hidden="true" onclick="app.spa.stack.remove()"><br>
    <input type="button" value="Clear"  hidden="true" onclick="app.spa.stack.clear()">
    `
  }
}


stack_display( // client side stack_class - for a spa
){
  // display stack list
  let html = `<b>Stack</b><br><select id="stack_list_select" size="10" onclick="app.spa.stack.select()">`
  for(let i=this.stack.length-1; -1 < i; i--){
    let obj = this.stack[i];
    html += `<option value="${i}">${obj.name}</option>`;
  }
  document.getElementById("stack_list").innerHTML = html + "</select>";
}


select(){ // client side stack_class - for a spa
  // display record clicked on
  const index = parseInt(document.getElementById("stack_list_select").value);  // convert string to integer
  this.display(index);

  // display buttons that should be clickable
  let button = document.getElementById("stack_buttons").firstElementChild;
  do {
    switch (button.value) {
      case "up": case "top":
        if (this.stack.length==1) {
          button.hidden = true; 
        } else {
          button.hidden = (index === this.stack.length-1);
        }
        break;  // show button

      case "down": case "bottom":
        if (this.stack.length==1) {
          button.hidden = true; 
        } else {
          button.hidden = !index;  // if index === 0 down will be hidden
        }
        break;

      default:
        button.hidden = false; // show 
        break;
    }
  
    button = button.nextSibling;
  }while (button)
}


clear(  // client side stack_class - for a spa
) {
  this.stack =[];
  this.stack_display();
}


remove(  // client side stack_class - for a spa
) {
  const index = document.getElementById("stack_list_select").value;
  this.stack.splice(index,1);  // remove element
  this.stack_display();
}


top(  // client side stack_class - for a spa
) {
  // get selected stack
  const index = document.getElementById("stack_list_select").value;
  const obj = this.stack[index];
  this.stack.splice(index,1);  // remove element

  this.stack.push(         obj);

  this.stack_display();
}


bottom(  // client side stack_class - for a spa
) {
  const index = document.getElementById("stack_list_select").value;
  const obj = this.stack[index];
  this.stack.splice(index,1);  // remove element

  this.stack.splice(0,0,obj);

  this.stack_display();
}


up(  // client side stack_class - for a spa
) {
  const index         = parseInt(document.getElementById("stack_list_select").value);
  const obj           = this.stack[index  ];

  this.stack[index  ] = this.stack[index+1];
  this.stack[index+1] = obj                ;

  this.stack_display();
}


down(  // client side stack_class - for a spa
) {
  const index         = parseInt(document.getElementById("stack_list_select").value);
  const obj           = this.stack[index  ];

  this.stack[index  ] = this.stack[index-1];
  this.stack[index-1] = obj                ;

  this.stack_display();
}


} // end of class stack_class

export {stack_class};
