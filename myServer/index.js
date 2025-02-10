const express = require("express");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const port = 3000;

const multer = require("multer");
const upload = multer();
app.use(upload.none());

app.use(express.json());

const cors = require("cors");
// Enable CORS for all HTTP methods
app.use(cors());

const fs = require("fs"); // file system module

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome route
 *     description: Returns a welcome message.
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/", (req, res) => {
  res.send("Welcome to the REST API");
});

// data
let assignments = require("./data.json");

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get assignments with pagination
 *     description: Retrieve a list of assignments with optional pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of assignments per page (default is 10).
 *     responses:
 *       200:
 *         description: A paginated list of assignments.
 */
app.get("/api/assignments", (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedAssignments = assignments.slice(startIndex, endIndex);

  res.json(paginatedAssignments);
});

/**
 * @swagger
 * /api/assignments/count:
 *   get:
 *     summary: Get total number of assignments
 *     description: Returns the total count of assignments.
 *     responses:
 *       200:
 *         description: Number of assignments.
 */
app.get("/api/assignments/count", (req, res) => {
  res.json({ count: assignments.length });
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get a specific assignment
 *     description: Retrieve an assignment by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the assignment.
 *     responses:
 *       200:
 *         description: Assignment found.
 *       404:
 *         description: Assignment not found.
 */
app.get("/api/assignments/:id", (req, res) => {
  const assignment = assignments.find((a) => a.id === parseInt(req.params.id));
  if (!assignment) return res.status(404).send("Assignment not found");
  res.json(assignment);
});

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignment
 *     description: Adds a new assignment to the list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               submitted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Assignment created successfully.
 */
app.post("/api/assignments", (req, res) => {
  console.log("DEBUG in post /api/assignments : ", req.body);

  const requiredFields = ["name", "dueDate"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing required field: ${field}`,
      });
    }
  }

  const lastId = assignments[assignments.length - 1].id || 0;
  const newAssignment = {
    id: lastId + 1,
    name: req.body.name,
    dueDate: req.body.dueDate,
    submitted: req.body.submitted || false,
  };
  assignments.push(newAssignment);
  // add new assignment to the json file
  fs.writeFile("data.json", JSON.stringify(assignments), (err) => {
    if (err) throw err;
    console.log("New assignment written to file");
  });
  res.status(201).json(newAssignment);
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update an assignment
 *     description: Updates an existing assignment.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the assignment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               submitted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Assignment updated successfully.
 *       404:
 *         description: Assignment not found.
 */
app.put("/api/assignments/:id", (req, res) => {
  const assignment = assignments.find((a) => a.id === parseInt(req.params.id));
  if (!assignment) return res.status(404).send("Assignment not found");

  assignment.name = req.body.name;
  assignment.dueDate = req.body.dueDate;
  assignment.submitted = req.body.submitted;
  res.json(assignment);
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     description: Removes an assignment from the list.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the assignment.
 *     responses:
 *       204:
 *         description: Assignment deleted successfully.
 *       404:
 *         description: Assignment not found.
 */
app.delete("/api/assignments/:id", (req, res) => {
  const assignmentIndex = assignments.findIndex(
    (a) => a.id === parseInt(req.params.id)
  );
  if (assignmentIndex === -1)
    return res.status(404).send("Assignment not found");

  assignments.splice(assignmentIndex, 1);
  res.status(204).send();
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
