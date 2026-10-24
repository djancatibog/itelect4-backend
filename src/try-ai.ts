import "dotenv/config";
import { draftReport } from "./ai/gemini";

// npm run try-ai. One real request to Gemini from your terminal --
// the same function POST /api/ai will call, with no Express, no
// token and no database. If this prints a draft, the key, the model
// name and the schema all work.
async function tryAi() {
  const draft = await draftReport(
    "I found a black Jansport backpack with a red keychain near the " +
      "gym bleachers on Friday afternoon. There is a notebook inside " +
      "with a name written on the cover.",
  );
  console.log(JSON.stringify(draft, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});