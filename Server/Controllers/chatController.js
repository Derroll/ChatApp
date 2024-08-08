const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { ChatPromptTemplate} = require("@langchain/core/prompts");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { StringOutputParser } = require("@langchain/core/output_parsers")
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { Client } = require("@elastic/elasticsearch");
const { ElasticVectorSearch } = require("@langchain/community/vectorstores/elasticsearch");
const config = require("../elasticDB/config");
const dotenv = require("dotenv");
dotenv.config();

const chatController = async(req, res) => {
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

    //LOAD
    const pages = [];
    const path = __dirname.split(/[/\\]/).slice(0, -1).join('/');
    const loaders = [
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_1.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_2.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_3.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_4.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_5.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_6.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_7.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_8.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_9.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_10.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_11.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_12.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_13.pdf`),
        new PDFLoader(`${path}/Data/Dog_Breed_Characteristics_Behavior_14.pdf`)
    ];
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
    /*
    pages
    [
        Document {
            pageContent: ,
            metadata: {
            },
            id:
        },
        Document {
            pageContent: ,
            metadata: {
            },
            id:
        }
    ]
    */
    console.log(pages.length);

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
    /* Test similarity
    const results = await vectorStore.similaritySearch("PROTECTION DOGS", 1);
    console.log(JSON.stringify(results, null, 2));
    */
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

module.exports = {
    chatController
}