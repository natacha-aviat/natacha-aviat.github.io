import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const target = join(root, "..", "tunnel");

rmSync(target, { recursive: true, force: true });
cpSync(out, target, { recursive: true });
console.log(`Static tunnel copied to ${target}`);
