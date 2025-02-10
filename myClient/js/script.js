const ASSIGNMENTS_REQ = "http://localhost:3000/api/assignments";
const ASSIGNMENTS_COUNT_REQ = "http://localhost:3000/api/assignments/count";

let currentPage = 1;
let limit = 5;
let totalAssignments = 0;
let totalPages = 1;
let editingAssignmentId = null; // Track the assignment being edited

// Fetch the total count of assignments
function fetchTotalAssignments() {
  fetch(ASSIGNMENTS_COUNT_REQ)
    .then((response) => response.json())
    .then((data) => {
      totalAssignments = data.count;
      totalPages = Math.ceil(totalAssignments / limit);
      updatePaginationButtons();
    });
}

// Send request to get assignments with pagination
function sendGetAssignmentsRequest(page = 1) {
  fetch(`${ASSIGNMENTS_REQ}?page=${page}&limit=${limit}`)
    .then((response) => response.json())
    .then((data) => {
      displayAssignmentResultsAsTable(data);
      currentPage = page;
      updatePaginationButtons();
    });
}

// Add or update an assignment
function submitAssignment(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const dueDate = document.getElementById("dueDate").value;
  const submitted = document.getElementById("submitted").checked;

  const assignmentData = { name, dueDate, submitted };

  // PUT if editing an assignment, POST if adding a new assignment depending on editingAssignmentId
  const requestMethod = editingAssignmentId ? "PUT" : "POST";
  const requestUrl = editingAssignmentId
    ? `${ASSIGNMENTS_REQ}/${editingAssignmentId}`
    : ASSIGNMENTS_REQ;

  fetch(requestUrl, {
    method: requestMethod,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignmentData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(
        editingAssignmentId ? "Assignment updated:" : "Assignment added:",
        data
      );
      document.getElementById("assignmentForm").reset();
      editingAssignmentId = null; // Reset editing mode
      fetchTotalAssignments();
      sendGetAssignmentsRequest(currentPage);
    })
    .catch((error) => console.error("Error:", error));
}

// Prefill the form for editing an assignment
function editAssignment(id, name, dueDate, submitted) {
  console.log(`Editing assignment ${id}`);
  // setting the title of the #actionForm to "Edit Assignment"
  document.getElementById("actionForm").textContent = "Edit Assignment " + id;

  document.getElementById("name").value = name;
  document.getElementById("dueDate").value = dueDate;
  document.getElementById("submitted").checked = submitted;
  editingAssignmentId = id; // Store the assignment ID
}

// Delete an assignment
function deleteAssignment(id) {
  fetch(`${ASSIGNMENTS_REQ}/${id}`, { method: "DELETE" })
    .then((response) => response.json())
    .then(() => {
      console.log(`Assignment ${id} deleted`);
      fetchTotalAssignments();
      sendGetAssignmentsRequest(currentPage);
      window.alert(`Assignment ${id} deleted`);
    })
    .catch((error) => window.alert("Error deleting assignment:", error));
}

// Display assignments in a table with edit & delete buttons
function displayAssignmentResultsAsTable(data) {
  const resultsDiv = document.querySelector("#results");
  resultsDiv.innerHTML = "";

  const table = document.createElement("table");

  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  ["ID", "Name", "Due Date", "Submitted", "Actions"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  const tbody = table.createTBody();
  data.forEach((assignment) => {
    const tr = tbody.insertRow();
    tr.insertCell().textContent = assignment.id;
    tr.insertCell().textContent = assignment.name;
    tr.insertCell().textContent = assignment.dueDate;
    tr.insertCell().textContent = assignment.submitted ? "Yes" : "No";

    // Action buttons (Edit & Delete)
    const actionCell = tr.insertCell();
    const editButton = document.createElement("button");
    editButton.textContent = "✏️ Edit";
    editButton.onclick = () =>
      editAssignment(
        assignment.id,
        assignment.name,
        assignment.dueDate,
        assignment.submitted
      );

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️ Delete";
    deleteButton.onclick = () => deleteAssignment(assignment.id);

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);
  });

  resultsDiv.appendChild(table);
}

// Update pagination button states
function updatePaginationButtons() {
  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages;
  document.getElementById("firstPage").disabled = currentPage === 1;
  document.getElementById("lastPage").disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
document.addEventListener("DOMContentLoaded", () => {
  fetchTotalAssignments();
  sendGetAssignmentsRequest();

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) sendGetAssignmentsRequest(currentPage - 1);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) sendGetAssignmentsRequest(currentPage + 1);
  });

  document.getElementById("firstPage").addEventListener("click", () => {
    sendGetAssignmentsRequest(1);
  });

  document.getElementById("lastPage").addEventListener("click", () => {
    sendGetAssignmentsRequest(totalPages);
  });

  document
    .getElementById("assignmentForm")
    .addEventListener("submit", submitAssignment);
});
