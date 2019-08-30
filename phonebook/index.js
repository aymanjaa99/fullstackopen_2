const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
morgan.token('body', req => {
  return JSON.stringify(req.body)
})
app.use(
  morgan(':method :url :status :response-time ms - :res[content-length] :body')
)

const PORT = process.env.PORT || 3000

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(p => p.toJSON()))
  })
})

app.get('/info', (req, res) => {
  res.send(`Phonebook has info about persons and their number} <p> ${new Date()}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
        return
      } else {
        res.status(404).end()
        return
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).send()

    })
    .catch(error => next(error))
  res.redirect('back')
})

app.put('/api/persons/:id', (req, res, next) => {
  console.log('PUT CALLED')
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatePerson => res.json(updatePerson.toJSON()))
    .catch(error => {
      next(error)
      return
    })
})
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(p => {
      res.json(p.toJSON())
    })
    .catch(error => next(error))
})

//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => console.log(`server running on ${PORT}`))
