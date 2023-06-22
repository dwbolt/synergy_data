class eventClass {
constructor(){

}

async main(
    url  //
){
    this.url   = url;
    this.graph = await app.proxy.getJSON(this.url);  
    this.edge  = app.urlParams.get('e'); // page to load

    document.getElementById("description").innerHTML = this.graph.edges[ this.edge ].description;
}
}

app.page = new eventClass();                          // creat page class
app.page.main(`/users/events/2023/_graph.json` );     // load & displayData