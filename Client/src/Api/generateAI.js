import axios from "axios";

export const generateAIApi = async(currentMessage) => {
    const body = {
        input: currentMessage
    }
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:3000/query",
            data: body
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};