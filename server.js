const express = require('express')
const path = require('path')
const app = express()
const port = 3000


app.get('/decks', (req, res) => {
  res.send('Hello World!')
})

app.get('/*', (req, res) => {
    const options = {
        root: path.join(__dirname, "public")
    }
    res.sendFile(req.path, options)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})