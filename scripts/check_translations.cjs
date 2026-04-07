const fs = require("fs");
const path = require("path");

const enTranslations = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../client/public/locales/en/translation.json"),
    "utf8",
  ),
);
const ukTranslations = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../client/public/locales/uk/translation.json"),
    "utf8",
  ),
);

function flattenKeys(obj, prefix = "") {
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(flattenKeys(enTranslations));
const ukKeys = new Set(flattenKeys(ukTranslations));

function findTranslationKeysInCode(dir, extensions = [".ts", ".tsx"]) {
  const keys = new Set();
  const dynamicKeys = [];

  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        walk(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, "utf8");

        // Match t('key'), t("key"), t(`key`), i18n.t('key'), i18n.t("key")
        const patterns = [
          /(?<!\w)t\(\s*['"]([^'"]+)['"]/g,
          /(?<!\w)t\(\s*`([^`$]+)`/g,
          /i18n\.t\(\s*['"]([^'"]+)['"]/g,
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            keys.add(match[1]);
          }
        }

        // Detect dynamic keys like t(`fish.${xxx}.name`)
        const dynamicPattern = /(?<!\w)t\(\s*`([^`]*\$\{[^`]+\}[^`]*)`/g;
        let dynMatch;
        while ((dynMatch = dynamicPattern.exec(content)) !== null) {
          const relPath = path.relative(dir, fullPath);
          dynamicKeys.push({ file: relPath, pattern: dynMatch[1] });
        }
      }
    }
  }

  walk(dir);
  return { keys, dynamicKeys };
}

const clientSrcDir = path.join(__dirname, "../client/src");
const { keys: codeKeys, dynamicKeys } = findTranslationKeysInCode(clientSrcDir);

const serverSrcDir = path.join(__dirname, "../server/src");
let serverKeys = new Set();
let serverDynamic = [];
if (fs.existsSync(serverSrcDir)) {
  const serverResult = findTranslationKeysInCode(serverSrcDir);
  serverKeys = serverResult.keys;
  serverDynamic = serverResult.dynamicKeys;
}

console.log("=== TRANSLATION ANALYSIS ===\n");

console.log("--- Keys in EN but MISSING in UK ---");
let missingInUk = 0;
for (const key of enKeys) {
  if (!ukKeys.has(key)) {
    console.log(`  MISSING UK: ${key}`);
    missingInUk++;
  }
}
if (missingInUk === 0) console.log("  ✅ All EN keys exist in UK");
console.log("");

console.log("--- Keys in UK but MISSING in EN ---");
let missingInEn = 0;
for (const key of ukKeys) {
  if (!enKeys.has(key)) {
    console.log(`  MISSING EN: ${key}`);
    missingInEn++;
  }
}
if (missingInEn === 0) console.log("  ✅ All UK keys exist in EN");
console.log("");

console.log("--- Keys used in CODE but MISSING from translation files ---");
const allTranslationKeys = new Set([...enKeys, ...ukKeys]);
let missingFromTranslations = 0;
const sortedCodeKeys = [...codeKeys].sort();
for (const key of sortedCodeKeys) {
  // Skip keys that look like they have fallback values (second argument)
  // Also skip keys that are clearly not translation keys
  if (!allTranslationKeys.has(key) && !key.includes("${")) {
    const missingIn = [];
    if (!enKeys.has(key)) missingIn.push("EN");
    if (!ukKeys.has(key)) missingIn.push("UK");
    console.log(`  ❌ ${key} (missing in: ${missingIn.join(", ")})`);
    missingFromTranslations++;
  }
}
if (missingFromTranslations === 0)
  console.log("  ✅ All static code keys exist in translations");
console.log("");

console.log("--- Dynamic translation keys (manual check recommended) ---");
for (const dk of dynamicKeys) {
  console.log(`  📝 ${dk.file}: t(\`${dk.pattern}\`)`);
}
if (dynamicKeys.length === 0) console.log("  No dynamic keys found");
console.log("");

if (serverKeys.size > 0 || serverDynamic.length > 0) {
  console.log("--- Server translation keys ---");
  for (const key of [...serverKeys].sort()) {
    const missingIn = [];
    if (!enKeys.has(key)) missingIn.push("EN");
    if (!ukKeys.has(key)) missingIn.push("UK");
    if (missingIn.length > 0) {
      console.log(`  ❌ ${key} (missing in: ${missingIn.join(", ")})`);
    } else {
      console.log(`  ✅ ${key}`);
    }
  }
  for (const dk of serverDynamic) {
    console.log(`  📝 ${dk.file}: t(\`${dk.pattern}\`)`);
  }
  console.log("");
}

console.log(
  "--- Translation keys NOT used in any code (potentially unused) ---",
);
const dynamicPrefixes = dynamicKeys
  .map((dk) => {
    // Extract prefix before ${
    const idx = dk.pattern.indexOf("${");
    return idx > 0 ? dk.pattern.substring(0, idx) : null;
  })
  .filter(Boolean);

let unusedCount = 0;
const allCodeAndServerKeys = new Set([...codeKeys, ...serverKeys]);
for (const key of [...allTranslationKeys].sort()) {
  if (!allCodeAndServerKeys.has(key)) {
    // Check if it might match a dynamic key prefix
    const matchesDynamic = dynamicPrefixes.some((prefix) =>
      key.startsWith(prefix),
    );
    if (!matchesDynamic) {
      console.log(`  ⚠️  ${key}`);
      unusedCount++;
    }
  }
}
if (unusedCount === 0)
  console.log("  ✅ All translation keys are used in code");
console.log("");

console.log("=== SUMMARY ===");
console.log(`EN keys: ${enKeys.size}`);
console.log(`UK keys: ${ukKeys.size}`);
console.log(`Code static keys: ${codeKeys.size}`);
console.log(`Code dynamic keys: ${dynamicKeys.length}`);
console.log(`Missing in UK: ${missingInUk}`);
console.log(`Missing in EN: ${missingInEn}`);
console.log(`Missing from translations: ${missingFromTranslations}`);
console.log(`Potentially unused: ${unusedCount}`);
