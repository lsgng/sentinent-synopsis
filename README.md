# GPT Character Tracing

Simple script to trace a character throughout a text.

This script finds all passages mentioning a given a specified character in a given text. It then recursively summarizes those passages and returns a final summary.

## Usage

1. Put the input text into `input.txt` or specify a different file using the `INPUT_TEXT` variable.
2. Specify the character name to trace using the `CHARACTER` variable.
3. Optional: Specify additional options (`CHUNK_OVERLAP`, `CHUNK_SIZE`, `SUMMARIZATION_GROUP_SIZE`)
3. Run the script: `yarn trace`

## Observations

- The script is not very efficient. Tracing longer texts will take a lot of time and might result in significant token usage.
- Limited quality of summary. Especially longer texts will often result in inconsistent summaries containing unnecessary details while leaving out important high-level information.