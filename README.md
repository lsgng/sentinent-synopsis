# Sentinent Synopsis

Use GPT to trace a character throughout a narrative text and generate a summary of their actions and personality.

Splits the input text into chunks, then recursively summarizes them.

## Usage

1. Create a `.env` file containing your OpenAI API key:
    
        OPENAI_API_KEY=sk-...

2. Run the script providing the input `*.txt` file and the character name:
    
        node synopsis.js -i <input_file> -c <character_name>
        