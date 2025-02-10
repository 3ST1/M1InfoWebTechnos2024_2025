window.onload=init;

const WS_URI = "http://localhost:3000/api/assignments";
let page = 0;
let limit = 10;

async function init(event) {
    // ask the number of assignments in the remote WS
    await updateCount();
    // display the current page
    sendRequestToRemoteWS(event);
}

async function updateCount() {
    fetch(`${WS_URI}/count`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // calculate the number of pages
            const nbPages = Math.ceil(data.count / limit);
            document.querySelector("#count").innerHTML = data.count;
            document.querySelector("#nbPages").innerHTML = nbPages;
      
            return;
        });
}

function sendRequestToRemoteWS(event) {
    // prevent the form from submitting and displaying the results
    // in a new page
    event.preventDefault();

    // send the request to the remote WS
    let URL = `${WS_URI}?page=${page}&limit=${limit}`;
    fetch(URL)
        .then(response => {
            // the response is a "promise"
            //console.log(response)
            // we need to decode that in order to get the data usable in JS
            response.json()
                .then(data => {
                    //console.log(data);

                    displayResultsAsTable(data);
                })
            console.log("INSIDE THE FETCH, AFTER REQUEST HAS BEEN SENT");

           
        })

    console.log("AFTER THE FETCH");
}


function nextPage(event) {
    page++;
    sendRequestToRemoteWS(event);
}

function prevPage(event) {
    if(page > 0) {
        page--;
        sendRequestToRemoteWS(event);
    }
}

function lastPage(event) {
    page = nbPages - 1;
    sendRequestToRemoteWS(event);
}

function displayResultsAsTable(data) {
    //console.log(data);

    // Get the div where we will display the results
    // query selector uses CSS selectors to find the element
    const resultsDiv = document.querySelector("#results");
    // clear the div
    resultsDiv.innerHTML = "";

    const table = document.createElement("table");


    data.forEach((assignment, index) => {
        console.log(assignment.name);

        // add a row using the table API
        const tr = table.insertRow();
        // add cells to the row
        const td1 = tr.insertCell();
        td1.textContent = assignment.name;
        const td2 = tr.insertCell();
        td2.textContent = assignment.dueDate;
        const td3 = tr.insertCell();
        td3.textContent = assignment.submitted;
        const td4 = tr.insertCell();
        td4.textContent = assignment.id;
    });

    // let's add the ul to the div
    resultsDiv.appendChild(table);
}

// Adding a new Assignment
function addAssignment(event) {
    event.preventDefault();

    // Build the formData object (content of the form in the proper format)
    const form = event.target;
    const formData = new FormData(form);
    // Particular case for the checkbox, it's a trap!
    // if the checkbox is not checked, it will not be included in the formData
    // and if it's not included, it will not be updated in the remote WS
    // If it is checked, the value will be 'on' if there is no value attribute
    // in the checkbox input element, otherwise it will be the value attribute
    // GOOD PRACTICE : always include a value attribute in the checkbox input element
    // and set it to 'true' or 'false' depending on the default value
    // and set it manually in the formData like below if you want it to be turned
    // into boolean value in the remote WS
    formData.set('submitted', form.querySelector('#submitted').checked);

    let divMessage = document.querySelector('#message');

    // use fetch to send a POST request to the remote WS
    fetch('http://localhost:3000/api/assignments', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
       divMessage.innerHTML = `Assignment "${data.name}" added successfully!`;
        form.reset();
        updateCount()
    })
    .catch(error => {
        console.error('Error:', error);
        divMessage.innerHTML = 'Failed to add assignment.';
    });
}

// Modifying / editing an existing Assignment
function editAssignment(event) {
    event.preventDefault();

    const editForm =event.target;
    let divMessage = document.querySelector('#message');

    // get the id of the assignment to edit
    const id = editForm.querySelector('#id').value;
    const submitted = editForm.querySelector('#submitted').value;
    console.log('submitted: ' + submitted);
    if(!id) {
        divMessage.innerHTML = 'CANNOT MODIFY! Please provide a valid assignment ID';
        return;
    }

    // Build the formData object (content of the form in the proper format)
    const formData = new FormData(editForm);
    // Particular case for the checkbox, it's a trap!
    // if the checkbox is not checked, it will not be included in the formData
    // and if it's not included, it will not be updated in the remote WS
    // If it is checked, the value will be 'on' if there is no value attribute
    // in the checkbox input element, otherwise it will be the value attribute
    // GOOD PRACTICE : always include a value attribute in the checkbox input element
    // and set it to 'true' or 'false' depending on the default value
    // and set it manually in the formData like below if you want it to be turned
    // into boolean value in the remote WS
    formData.set('submitted', editForm.querySelector('#submitted').checked);

    console.log(formData);
    // print all the key-value pairs
    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }


    // use fetch to send a POST request to the remote WS
    let URL = 'http://localhost:3000/api/assignments/' + id;
    fetch(URL, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
       divMessage.innerHTML = `Assignment "${data.name}" edited successfully!`;
       editForm.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        divMessage.innerHTML = 'Failed to edit assignment.';
    });
}

