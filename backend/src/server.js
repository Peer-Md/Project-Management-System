import app from "./app.js";
import { loadEnv } from "./loadEnv.js";

loadEnv();

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
