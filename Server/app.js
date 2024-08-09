const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const fs = require('fs');
const { chatController } = require("./Controllers/chatController");
const { uploadController } = require("./Controllers/uploadController");

const PORT = process.env.PORT;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (!fs.existsSync('Uploads')) {
    fs.mkdirSync('Uploads');
}

app.get('/health', (req, res)=>{
    res.send("Normal");
})
app.post('/query', async(req, res)=>{
    await chatController(req, res);
});
app.post('/upload', upload.single('file'), async(req, res)=>{
    try {
        await uploadController(req, res);    
    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(` --- SERVER IS LISTENING TO PORT ${PORT} --- `);
})