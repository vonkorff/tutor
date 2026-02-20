const fs = require("fs");
const path = require("path");
const http = require("http");

loadDotEnv(path.join(__dirname, ".env"));

const port = Number(process.env.PORT) || 3000;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Add it to your .env file before starting the server.");
  process.exit(1);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/tutor") {
      const body = await readJsonBody(req);
      const question = typeof body.question === "string" ? body.question.trim() : "";

      if (!question) {
        return sendJson(res, 400, { error: "Question is required." });
      }

      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.5,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                "You are a patient tutor. Give clear, concise explanations. Ask a follow-up question when helpful.",
            },
            { role: "user", content: question },
          ],
        }),
      });

      const completion = await openAiResponse.json();
      if (!openAiResponse.ok) {
        console.error("OpenAI request failed:", completion?.error?.message || openAiResponse.statusText);
        return sendJson(res, 502, { error: "Tutor is temporarily unavailable. Please try again." });
      }

      const answer = completion?.choices?.[0]?.message?.content?.trim();
      if (!answer) {
        return sendJson(res, 502, { error: "No response from tutor model." });
      }

      return sendJson(res, 200, { answer });
    }

    if (req.method === "GET") {
      return serveStatic(req, res);
    }

    sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    console.error("Server error:", error?.message || error);
    sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(port, () => {
  console.log(`Chatbot tutor server running at http://localhost:${port}`);
});

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(requestPath).replace(/^\/+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    sendJson(res, 403, { error: "Forbidden." });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
