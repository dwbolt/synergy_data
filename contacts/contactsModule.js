class contactsModule { 

constructor(){}

public(){
    alert("public");
}

#private(){
    alert("private");
}

getPrivate() {
    this.#private();
}
}


export { contactsModule };