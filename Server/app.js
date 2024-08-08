const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const { chatController } = require("./Controllers/chatController");

const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res)=>{
    res.send("Normal");
})
app.post('/query', async(req, res)=>{
    await chatController(req, res);
});

app.listen(PORT, () => {
    console.log(` --- SERVER IS LISTENING TO PORT ${PORT} --- `);
})