import * as dotenv from "dotenv";
import { PromptTemplate } from "langchain";
import { TextLoader } from "langchain/document_loaders";
import { OpenAI } from "langchain/llms";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const CHUNK_OVERLAP = 200;
const CHUNK_SIZE = 2000;
const SUMMARIZATION_GROUP_SIZE = 4;

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const args = yargs(hideBin(process.argv))
  .alias("i", "input")
  .alias("c", "character")
  .parse();

const INPUT_TEXT = args.input;
const CHARACTER_NAME = args.character;

if (!INPUT_TEXT || !CHARACTER_NAME) {
  console.log(
    "Please provide an input text file and a character name to summarize."
  );
  console.log("Example: node main.js -i ./input.txt -c Harry");
  process.exit(1);
}

const loader = new TextLoader(INPUT_TEXT);
const rawText = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkOverlap: CHUNK_OVERLAP,
  chunkSize: CHUNK_SIZE,
});

const documents = await textSplitter.splitDocuments(rawText);

const filteredDocuments = documents.filter((doc) => {
  return doc.pageContent.includes(CHARACTER_NAME);
});

if (filteredDocuments.length === 0) {
  console.log(`No documents containing "${CHARACTER_NAME}" found.`);
  process.exit(1);
} else {
  console.log(
    `Found ${filteredDocuments.length} documents containing "${CHARACTER_NAME}"\n`
  );
}

const model = new OpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  openAIApiKey: OPENAI_API_KEY,
});

const template =
  "Give a brief, concise and consistent summary of the character {character} in the following text, including relevant actions and personality traits.\n TEXT: {text}\n SUMMARY: ";
const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["character", "text"],
});

async function summarizeResults(documents, summarizationGroupSize) {
  if (documents.length === 1) {
    return documents[0];
  }

  console.log(
    documents.length / summarizationGroupSize > 1
      ? `Summarizing ${documents.length} documents into ${Math.ceil(
          documents.length / summarizationGroupSize
        )} documents...`
      : "Creating final summary..."
  );
  const summarizationPromises = [];

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
      character: CHARACTER_NAME,
    });

    summarizationPromises.push(model.call(prompt));
  }

  const summarizedResults = await Promise.all(summarizationPromises);

  return summarizeResults(summarizedResults, summarizationGroupSize);
}

const text = filteredDocuments.map((doc) => doc.pageContent);

const summary = await summarizeResults(text, SUMMARIZATION_GROUP_SIZE);

console.log(`\nSummary for ${CHARACTER_NAME}:\n\n`, summary);
