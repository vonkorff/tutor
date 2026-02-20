# Chatbot Tutor (OpenAI-backed)

This app runs a browser chat UI with a Node/Express backend that calls the OpenAI API.

## Security model

- The OpenAI API key is loaded from an environment variable on the server.
- The API key is **never** sent to browser code.
- `.env` is ignored by git to prevent accidental key commits.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file from the template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and set:
   - `OPENAI_API_KEY` (required)
   - `OPENAI_MODEL` (optional, default: `gpt-4o-mini`)
   - `PORT` (optional, default: `3000`)

4. Start the server:
   ```bash
   npm start
   ```

Then open `http://localhost:3000`.

## API endpoint

- `POST /api/tutor`
- Request body:
  ```json
  { "question": "Explain photosynthesis" }
  ```
- Response body:
  ```json
  { "answer": "..." }
  ```
