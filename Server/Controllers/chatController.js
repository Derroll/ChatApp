const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { StringOutputParser } = require("@langchain/core/output_parsers")
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { Client } = require("@elastic/elasticsearch");
const { ElasticVectorSearch } = require("@langchain/community/vectorstores/elasticsearch");
const config = require("../elasticDB/config");
const fs = require('fs').promises;
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const rootPath = __dirname.split(/[/\\]/).slice(0, -1).join('/');
const uploadPath = `${rootPath}/Uploads`

const chatController = async (req, res) => {
    const query = req.body;
    //MODEL
    const model = new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0.2,
        verbose: true
    })

    //PROMPT
    const prompt = ChatPromptTemplate.fromTemplate(`
        Answer the user questions
        Context: {context}
        Question: {input}
    `)
    //Fetch the file paths
    const loaders = await getFilePath(uploadPath);

    //LOAD
    const pages = [];
    const splitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 2000,
        chunkOverlap: 150
    })
    for (const loader of loaders) {
        //doc is an array of pageContent, metadata and id
        const doc = await loader.load();
        pages.push(doc[0]);
    }
    console.log("Number of documents",pages.length);

    //SPLIT
    const splitDocs = await splitter.splitDocuments(pages);

    //INDEX DOCUMENTS and EMBEDDING
    const clientArgs = {
        client: new Client(config),
        indexName: process.env.ELASTIC_INDEX ?? "dogs_vectorstore"
    }
    const embeddings = new OpenAIEmbeddings();

    //VECTOR STORE
    const vectorStore = new ElasticVectorSearch(embeddings, clientArgs);
    const ids = await vectorStore.addDocuments(splitDocs);
    console.log(ids);
    
    const retriever = vectorStore.asRetriever({
        k: 2
    })
    const chain = await createStuffDocumentsChain({
        llm: model,
        prompt,
        outputParser: new StringOutputParser()
    })
    const retrievalChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever
    })
    const response = await retrievalChain.invoke({
        input: query.input
    })
    console.log(response.answer);
    await vectorStore.delete({ ids });
    res.send(response.answer)
}

const getFilePath = async(uploadPath) => {
    try {
        const files = await fs.readdir(uploadPath);
        const filePaths = files
            .map(file => path.join(uploadPath, file));
        const loaders = filePaths.map(filePath => new PDFLoader(filePath));
        return loaders;
    } catch (error) {
        return console.error("Error reading directory", error);
    }
}

module.exports = {
    chatController
}