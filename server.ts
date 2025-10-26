// server.ts
import { createServer } from "http";
import next from "next";
import { initSocket } from "./src/lib/socketServer"; // No .js extension needed

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Initialize socket server
  initSocket(server);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log(`🚀 Ready on http://localhost:${PORT}`);
  });
});
