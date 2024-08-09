import axios from "axios";

export const generateAIApi = async(currentMessage) => {
    const url = import.meta.env.VITE_GENERATE_AI_API;
    const body = {
        input: currentMessage
    }
    try {
        const response = await axios({
            method: "post",
            url,
            data: body
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};