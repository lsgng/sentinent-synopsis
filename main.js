import * as dotenv from "dotenv";
import { PromptTemplate } from "langchain";
import { TextLoader } from "langchain/document_loaders";
import { OpenAI } from "langchain/llms";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const INPUT_TEXT = "input.txt";
const CHARACTER = "Mustapha";

const CHUNK_OVERLAP = 200;
const CHUNK_SIZE = 2000;

const SUMMARIZATION_GROUP_SIZE = 4;

const loader = new TextLoader(INPUT_TEXT);
const rawText = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkOverlap: CHUNK_OVERLAP,
  chunkSize: CHUNK_SIZE,
});

const documents = await textSplitter.splitDocuments(rawText);

const filteredDocuments = documents.filter((doc) => {
  return doc.pageContent.includes(CHARACTER);
});

console.log(
  `Found ${filteredDocuments.length} documents containing "${CHARACTER}"`
);

const model = new OpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  openAIApiKey: OPENAI_API_KEY,
});

const template =
  "You are an expert in describing characters and summarizing their actions in a literary text. Your task is to give a brief and concise summary of the actions of the character {character} in the following text. Focus only on the character {character} and ignore all irrelevant actions of other characters. Summarize the text in a way that it is understandable and makes sense for a person who does not know the rest of the text. TEXT: {text}";
const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["character", "text"],
});

async function summarizeResults(documents, summarizationGroupSize) {
  if (documents.length === 1) {
    return documents[0];
  }

  let summarizedResults = [];

  for (let i = 0; i < documents.length; i += summarizationGroupSize) {
    let combinedText = "";
    let elementsToCombine = Math.min(
      summarizationGroupSize,
      documents.length - i
    );

    for (let j = 0; j < elementsToCombine; j++) {
      combinedText +=
        documents[i + j] + (j < elementsToCombine - 1 ? "\n" : "");
    }

    const prompt = await promptTemplate.format({
      text: combinedText,
      character: CHARACTER,
    });

    const result = await model.call(prompt);

    summarizedResults.push(result);
  }

  console.log(
    `Summarized ${documents.length} documents into ${summarizedResults.length} documents.`
  );

  return summarizeResults(summarizedResults, summarizationGroupSize);
}

const text = filteredDocuments.map((doc) => doc.pageContent);

const summary = await summarizeResults(text, SUMMARIZATION_GROUP_SIZE);

console.log("\nSummary:\n\n", summary);
