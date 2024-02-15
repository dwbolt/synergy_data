class relation_class {


constructor( // client side relation_class - for a spa
){
  this.index;

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


creat_index( // client side relation_class
){
  this.index = {};kk
  
  const relations = app.spa.db.getTable("relations");
  if (relations === undefined) {
    return // this database does not have a relation table.
  }
  const pks       = relations.get_PK();    // array of PK keys for entire table;
  for(let i=0; i< pks.length; i++) {
    let pk = pks[i];
    let relation = relations.get_object(pk);  // row as a json object
    this.init(pk, relation.table_1, relation.pk_1, relation.table_2, relation.pk_2);
    this.init(pk, relation.table_2, relation.pk_2, relation.table_1, relation.pk_1);
  }
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


pk_get( // client side relation_class
    table_1
    ,pk_1
    ,table_2
    ,pk_2
) {
    // return pk for relation, or undefine if does not exist
    if (this.index[table_1]                 === undefined) {return undefined;}
    if (this.index[table_1][pk_1]           === undefined) {return undefined;}
    if (this.index[table_1][pk_1][table_2]  === undefined) {return undefined;}

    return this.index[table_1][pk_1][table_2][pk_2];  // will be relation pk or undefined
}


} // end of class relation_class

export {relation_class};

