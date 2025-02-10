const WS_URI = "https://jsonplaceholder.typicode.com/users";

const METALLICA_URI = "https://wasabi.i3s.unice.fr/api/v1/artist_all/name/";

function sendRequestToRemoteWS(event) {
    event.preventDefault();

    fetch(WS_URI)
        .then(response => {
            // the response is a "promise"
            //console.log(response)
            // we need to decode that in order to get the data usable in JS
            response.json()
                .then(data => {
                    //console.log(data);
                    //displayResultsAsList(data);

                    displayResultsAsTable(data);
                })
            console.log("INSIDE THE FETCH, AFTER REQUEST HAS BEEN SENT")

           
        })

    console.log("AFTER THE FETCH");
}

function displayResultsAsList(data) {
    //console.log(data);

    // Get the div where we will display the results
    // query selector uses CSS selectors to find the element
    const resultsDiv = document.querySelector("#results");
    // clear the div
    resultsDiv.innerHTML = "";

    const ul = document.createElement("ul");


    data.forEach((user, index) => {
        console.log(user.name);
        const li = document.createElement("li");
        li.innerHTML = `<b>${user.name}</b> - ${user.email}`;

        // append the li to the ul
        ul.appendChild(li);
    });

    // let's add the ul to the div
    resultsDiv.appendChild(ul);
}

function displayResultsAsTable(data) {
    //console.log(data);

    // Get the div where we will display the results
    // query selector uses CSS selectors to find the element
    const resultsDiv = document.querySelector("#results");
    // clear the div
    resultsDiv.innerHTML = "";

    const table = document.createElement("table");


    data.forEach((user, index) => {
        console.log(user.name);

        // add a row using the table API
        const tr = table.insertRow();
        // add cells to the row
        const td1 = tr.insertCell();
        td1.textContent = user.name;
        const td2 = tr.insertCell();
        td2.textContent = user.email;
        /*
        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>`;

        // append the li to the ul
        table.appendChild(tr);
        */
    });

    // let's add the ul to the div
    resultsDiv.appendChild(table);
}

function sendRequestToMusicRemoteWS(event) {
    // prevent the default behavior of the form
    // we do not want the browser to display a blank page
    event.preventDefault();

    // Get the value from the search input field
    const searchInput = document.querySelector("#searchInput");
    console.log(searchInput.value);

    // get the value
    const searchValue = searchInput.value;
    let URL = METALLICA_URI + searchValue + "fojdgi";
    console.log("URL: " + URL);

    fetch(URL)
        .then(response => {
            // the response is a "promise"
            //console.log(response)
            // we need to decode that in order to get the data usable in JS
            response.json()
                .then(data => {
                    //console.log(data);
                    //displayResultsAsList(data);

                    displayMusicResultsAsTable(data);
                })
            console.log("INSIDE THE FETCH, AFTER REQUEST HAS BEEN SENT")
            
           
        }).catch(error => {
            alert('NETWORK Error or BAD URL:', error);
        })
    

    console.log("AFTER THE FETCH");
}

function displayMusicResultsAsTable(data) {
    if(data.members === undefined){
       alert("NO ANSWER FOR THIS SEARCH !");
        return
    }
    //console.log(data);

    // Get the div where we will display the results
    // query selector uses CSS selectors to find the element
    const resultsDiv = document.querySelector("#results");
    // clear the div
    resultsDiv.innerHTML = "";

    const table = document.createElement("table");

    const members = data.members;

    members.forEach((user, index) => {
        console.log(user.name);

        // add a row using the table API
        const tr = table.insertRow();
        // add cells to the row
        const td1 = tr.insertCell();
        td1.textContent = user.name;
        const td2 = tr.insertCell();
        td2.textContent = user.instruments[0];
        /*
        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>`;

        // append the li to the ul
        table.appendChild(tr);
        */
    });

    // let's add the ul to the div
    resultsDiv.appendChild(table);
}
