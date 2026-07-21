import fs from "fs";
import path from "path";
import { Client } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");
  const dir = path.join(process.cwd(), "supabase/migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log("Applying", file);
    await client.query(sql);
  }
  await client.end();
  console.log("Done");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
