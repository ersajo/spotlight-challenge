const express = require("express");
const cors = require('cors')
const controller = require("./controller/ligths");
const app = express();
const PORT = 4000;

app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.post('/', controller.run);