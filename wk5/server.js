const express = require('express')
const path = require('path')

const app = express()
const usersRouter = express.Router()

// app.get(/)

//Mount the router
app.use('/cars', usersRouter)

app.use(express.json())
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`)
  next()
})

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

app.get('/frontend', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.html'))
})

app.get('/', (req, res) => {
  res.send('Hello from the server!')
})

app.get('/api/student', (req,res)=> {
  res.json({
    id: 1,
    name:"Praise",
    Courses : ["Information Technology","Business Management"],
    active: true
  })
})

//route with parameters
app.get('/api/student/:userId', (req,res)=> {
  const userId = Number.parseInt(req.params.userId, 10)
  if(Number.isNaN(userId)){
    res.status(400).send("User ID requested is not valid: " + req.params.userId)
  }
  else{
    res.send("User ID requested is: " + userId)
  }
})

// ROUTE WITH MULTIPLE PARAM
app.get('/api/student/:id/:name',(req,res)=>{
  res.json({
    id: req.params.id,
    name: req.params.name,
  })
})

// Route with query parameters
app.get('/search', (req,res)=> {
  const term = req.query.q
  const page = req.query.page

  if(req.query.q==="CST3144"){
    res.send('Search for CST3144')
  }else{
    res.send('Search for something else')
  }
})

//Route with handler and multiple methods
app.get('/api/student', (req,res)=>{
  res.send('Get all students')
})

app.post('/api/student', (req,res)=>{
  res.send('get all student')
})

app.put('/api/student/:id', (req,res)=>{
  res.send(`the student id is : ${req.params.id}`)
})

app.delete('/api/student/:id', (req, res) => {
  res.send(`Student ${req.params.id} has been deleted.`)
})


// Chanining of route methods
app.route('/api/student')
  .get((req,res) => {
    res.send('Get all Student')
  })
  .post((req,res)=> {
    res.send('Create a student')
  })
  .put((req,res)=>{
    res.send('Update the Student Profile')
  })

//

if (require.main === module) {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}


module.exports = app
