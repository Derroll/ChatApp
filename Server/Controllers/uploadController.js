const uploadController = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File ${req.file.originalname} uploaded successfully.`);
}

module.exports = {
    uploadController
}