import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

export const generateAIApi = async(currentMessage) => {
    const body = {
        input: currentMessage
    }
    try {
        const response = await axios({
            method: "post",
            url: process.env.GENERATE_AI_API,
            data: body
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};