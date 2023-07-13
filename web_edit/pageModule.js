class web_edit {


constructor( // client side web_edit - for a page
) {

}

async load(// client side web_edit - for a page
){
    
    const resp = await app.proxy.RESTget("/users/web_edit/index.html");
    if (resp.ok) {
        document.getElementById("code").value =  resp.value;
    } else {
        alert(`error in "web_edit.load" error="${resp.value}"`)
    }

}


async save(// client side web_edit - for a page
){
    const text = document.getElementById("code").value;
    const resp = await app.proxy.RESTpost(text,"/users/web_edit/index.html");

    if (resp.ok) {
        alert(`save sucessful, length=${text.length} bytes`);
    } else {
        alert(`Error status="${resp.status}"`);
    }
}


}

//export {web_edit};


app.page = new web_edit(); 
app.page.load();
