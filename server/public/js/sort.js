function sort(string) {
    console.log("sorting by " + string); 
    
    categories = ["relevance", "recent", "money"]; 
    
    elem = document.getElementById(string)
    console.log(elem)
    console.log(elem.classList)
    elem.classList.remove('inactive'); 
    elem.classList.add('active'); 
    console.log(elem)
    
    for (e in categories) {
        if (categories[e] != string) {
            cat = document.getElementById(categories[e])
            cat.classList.remove('active'); 
            cat.classList.add('inactive'); 
        }
    }
    
    // need to sort by category here when we connect to database
    
    
}