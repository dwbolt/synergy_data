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


stack( // client side stack_class - for a spa
obj){
  this.stack.push(obj);
  this.display(this.stack.lenght-1);
  
  this.table_active[1].name = this.table_active.active.name;                                  // rember table name
  this.table_active[1].pk   = this.tableUX[this.table_active.active.name].recordUX.get_pk();  // rember pk
}


display(  // client side stack_class - for a spa
  index  // of relation to index
) {
  const obj = this.stack[index];
  // now display
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
