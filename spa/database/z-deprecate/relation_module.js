class relation_class {


constructor( // client side relation_class - for a spa
){
  this.index;
  this.element = document.getElementById("relation_record");  // 
  this.stack   = document.getElementById("stack_record"   );  //
  /*this.index = {
    "table1":{
      "pk1":{table1:{pk1: "pk_edge", pk2":"pk_edge"}
            ...
             {pk1: "pk_edge", pk2":"pk_edge"}
      ...
      "pkN":{table1:{pk1: "pk_edge", pk2":"pk_edge"}
     }
    ,"tableN":{...}
  }
*/
}


create_index( // client side relation_class
){
  this.index = {};
  
  this.relations = app.spa.db.getTable("relations");
  if (this.relations === undefined) {
    return // this database does not have a relation table.
  }
  const pks       = this.relations.get_PK();    // array of PK keys for entire table;
  for(let i=0; i< pks.length; i++) {
    this.pk_index(pks[i]);
  }
}


pk_index(  // client side relation_class
  pk  // of relation to index
) {
  let relation = this.relations.get_object(pk);  // row as a json object
  this.init(pk, relation.table_1, relation.pk_1, relation.table_2, relation.pk_2);
  this.init(pk, relation.table_2, relation.pk_2, relation.table_1, relation.pk_1);
}


init(  // client side relation_class
   pk                // relation pk
  ,table_name1       // 
  ,table_name_pk1    // 
  ,table_name2       // 
  ,table_name_pk2    // primary key of table
){
  if (this.index[table_name1] === undefined) {
    this.index[table_name1] = {};                                             // create empty object
  }

  if (this.index[table_name1][table_name_pk1] === undefined) {
    this.index[table_name1][table_name_pk1] = {};                              // create empty object
  }

  if (this.index[table_name1][table_name_pk1][table_name2] === undefined) {
    this.index[table_name1][table_name_pk1][table_name2] = {};                 // create empty object
  }

  const pk_relation = this.index[table_name1][table_name_pk1][table_name2][table_name_pk2];
  if ( pk_relation === undefined) {
    this.index[table_name1][table_name_pk1][table_name2][table_name_pk2]  = pk;  // pk for relation
  } else {
    // it is an error for value to be defined
    alert(`file="relation_module"
method="init"
table_name1   = "${table_name1}"
table_name_pk1= "${table_name_pk1}"
table_name2   = "${table_name2}"
table_name_pk2= "${table_name_pk2}"
pk_relation   = "${pk_relation}"`)
  }
}


edit( // client side relation_class
  table_1  // from selected record 
  ,pk_1   
  ) {
    const body = document.getElementById(`stack_record`).shadow_by_id("body");
    if (0 === body.innerHTML.length) {
      return; // there is nothing in the stack, so nothing to do;
    }
  
    const table_2 = this.stack.table.name ;
    const pk_2    = this.stack.get_pk();
  
    // return pk for relation, or undefine if does not exist
    this.pk = undefined;
    if (this.index[table_1] && this.index[table_1][pk_1] && this.index[table_1][pk_1][table_2]) {
      this.pk =  this.index[table_1][pk_1][table_2][pk_2]; // may still be undefined
    }
  
    // will be relation pk or undefined
    this.element.set_pk(this.pk);
    this.element.edit();
  
    if (this.pk === undefined) {
      // add table1 and table 2 values
      this.element.shadow_by_id("pk_1"   ).value = pk_1 ;  
      this.element.shadow_by_id("table_1").value = table_1;
  
      this.element.shadow_by_id("pk_2"   ).value =  pk_2;
      this.element.shadow_by_id("table_2").value =  table_2
    }
  }


} // end of class relation_class

export {relation_class};
