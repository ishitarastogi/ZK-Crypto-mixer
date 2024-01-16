const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors())


const aspRoutes = require('./routes/asp')

app.use(express.json())
app.use('/api/asp', aspRoutes)

const port = 8080

app.listen(port, ()=>{
    console.log("Server is up on port "+port);
}) 