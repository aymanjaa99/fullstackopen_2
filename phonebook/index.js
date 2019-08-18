const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var morgan = require("morgan");

app.use(morgan("tiny"));
app.use(bodyParser.json());

const PORT = 3000;
let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

const isNamePresent = name => {
  return persons.some(p => {
    return p.name === name;
  });
};
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(`Phonebook has info about ${persons.length} <p> ${new Date()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);
  if (person !== undefined) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const min = 10;
  const max = 1000;

  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name missing"
    });
  }

  if (isNamePresent(body.name)) {
    return res.status(400).json({
      error: "name already exists"
    });
  }

  const id = Math.floor(Math.random() * (max - min)) + min;
  const person = {
    name: body.name,
    number: body.number,
    id: id
  };

  persons = persons.concat(person);
  console.log(person);
  res.json(person);
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
