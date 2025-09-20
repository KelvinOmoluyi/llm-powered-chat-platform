const PORT = 8000

import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.use(cors())
app.use(json())

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)

app.post("/gemini", async (req, res) => {
  const { history = [], message } = req.body;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 100 } });

  const stream = await chat.sendMessageStream(message);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let full = "";
  for await (const chunk of stream.stream) {
    const delta = chunk.text();
    full += delta;
    res.write(`data: ${JSON.stringify({ delta })}\n\n`);
  }
  res.write(`data: ${JSON.stringify({ done: true, text: full })}\n\n`);
  res.end();
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

