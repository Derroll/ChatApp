import axios from "axios";
import FormData from "form-data";

export const uploadPDF = async (selectedFile) => {
    if (selectedFile) {
        const form = new FormData();
        form.append('file', selectedFile);
        try {
            const response = await axios({
                method: "post",
                url: "http://localhost:3000/upload",
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