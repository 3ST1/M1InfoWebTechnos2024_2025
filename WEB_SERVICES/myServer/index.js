const express = require('express');
const req = require('express/lib/request');
const cors = require('cors');
const app = express();
const port = 3000;

// Some data to work with
let assignments = require('./data.json');

// Enable CORS for all HTTP methods
app.use(cors());

const multer = require('multer');
// Do not use multer for uploading files, not for the moment....
const upload = multer(); 
// Ajout du middleware multer pour parser le form-data
app.use(upload.none());

// Basic Route
app.get('/', (req, res) => {
    res.send('Hello M1 Info! Welcome to the Assignments REST API!');
});

// Get All Assignments
app.get('/api/assignments', (req, res) => {
    // add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // get the assignments between the start and end index
    const results = assignments.slice(startIndex, endIndex);
    res.json(results);
});

// Get a Single Assignment by ID or count
app.get('/api/assignments/:id', (req, res) => {
     // check if id is equal to "count"
     if (req.params.id === "count") {
        return res.json({ count: assignments.length });
    } 

    const assignment = assignments.find(a => a.id === parseInt(req.params.id));
    if (!assignment) return res.status(404).send('Assignment not found');
    res.json(assignment);
});

// Create a New Assignment
app.post('/api/assignments', (req, res) => {
    const newAssignment = {
        // get the id of the last assignment and increment it by 1
        // for the new assignment
        id: assignments[assignments.length-1] + 1,
        name: req.body.name,
        dueDate: req.body.dueDate,
        submitted: req.body.submitted || false
    };
    assignments.push(newAssignment);
    console.log(`New assignment created: ${newAssignment.name} with ID: ${newAssignment.id}`);
    res.status(201).json(newAssignment);
});

// Update an Assignment
app.put('/api/assignments/:id', (req, res) => {
    const assignment = assignments.find(a => a.id === parseInt(req.params.id));
    if (!assignment) return res.status(404).send('Assignment not found');
    console.log(assignment)
    console.log(req.body)
    assignment.name = req.body.name;
    assignment.dueDate = req.body.dueDate;
    assignment.submitted = req.body.submitted;
    console.log(`Assignment ${req.params.id} updated! submitted: ${assignment.submitted}`);
    res.json(assignment);
});

// Delete an Assignment
app.delete('/api/assignments/:id', (req, res) => {
    console.log("Request to DELETE assignment with ID: ", req.params.id);

    const assignmentIndex = assignments.findIndex(a => a.id === parseInt(req.params.id));
    if (assignmentIndex === -1) return res.status(404).send('Assignment not found');

    assignments.splice(assignmentIndex, 1);
    console.log(`Assignment ${req.params.id} deleted!`);
    res.status(204).send();
});

// Get the total count of assignments
app.get('/api/assignments/count', (req, res) => {
    res.json({ count: assignments.length });
});

// Basic Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Handle 404 Errors
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
