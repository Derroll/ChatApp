import axios from "axios";
import FormData from "form-data";
import * as dotenv from "dotenv";
dotenv.config();

export const uploadPDF = async (selectedFile) => {
    if (selectedFile) {
        const form = new FormData();
        form.append('file', selectedFile);
        try {
            const response = await axios({
                method: "post",
                url: process.env.UPLOAD_API,
                data: form,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
};