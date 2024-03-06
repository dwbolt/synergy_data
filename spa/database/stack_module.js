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
  const record     = app.spa.tableUX[table_name].getModel.get_object(); 
  
  let name;

  switch (table_name) {
    case "people": name =`${record.name_last}, ${record.name_first}` ; break;
  
    default:
      alert(`file="stack_module.js"
method="push"
this.table_active.name="${this.table_active.name}"
msg="case not handled"`);
      name="not defined"
      break;
  }

  obj.name = name;
  this.stack.push(obj);
  this.display(this.stack.lenght-1);
}


display(  // client side stack_class - for a spa
  index  // of relation to display
) {
  const obj = this.stack[index];

  // now display stack list
  let html = ""
  for(let i=this.stack.lenght-1; 0<i; i--){
    html += ``;
  }
  document.getElementById("").innerHTML = html;
}


clear(  // client side stack_class - for a spa
) {
 this.stack =[];
  // now display
}


remove(  // client side stack_class - for a spa
index
) {
 this.stack.remove(index);
  // now display
}


up(  // client side stack_class - for a spa
index
) {
  const obj           = this.stack[index  ];
  this.stack[index  ] = this.stack[index+1];
  this.stack[index+1] = obj                ;
  // now display

}


down(  // client side stack_class - for a spa
index
) {
  const obj           = this.stack[index  ];
  this.stack[index  ] = this.stack[index-1];
  this.stack[index-1] = obj                ;
  // now display

}


top(  // client side stack_class - for a spa
index
) {
  const obj = this.stack[index];
  this.stack.remove[     index];
  this.stack.push(         obj);
  // now display

}


bottom(  // client side stack_class - for a spa
index
) {
  const obj = this.stack[index];
  this.stack.remove[     index];
  this.stack.splice(0,0,obj);
  // now display

}

} // end of class stack_class

export {stack_class};
