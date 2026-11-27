import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const projectRoot = process.cwd();
const extensions = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs", ".json"];

function resolveCandidate(basePath) {
  if (existsSync(basePath) && statSync(basePath).isFile()) {
    return basePath;
  }
  if (basePath.endsWith(".js")) {
    const withoutJs = basePath.slice(0, -3);
    for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mjs"]) {
      if (existsSync(withoutJs + ext) && statSync(withoutJs + ext).isFile()) {
        return withoutJs + ext;
      }
    }
  }
  for (const ext of extensions) {
    if (existsSync(basePath + ext) && statSync(basePath + ext).isFile()) {
      return basePath + ext;
    }
  }
  for (const idx of ["index.ts", "index.tsx", "index.js"]) {
    const joined = path.join(basePath, idx);
    if (existsSync(joined) && statSync(joined).isFile()) {
      return joined;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const candidate = resolveCandidate(path.join(projectRoot, specifier.slice(2)));
    if (candidate) {
      return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentPath = context.parentURL
      ? path.dirname(fileURLToPath(context.parentURL))
      : projectRoot;
    const candidate = resolveCandidate(path.resolve(parentPath, specifier));
    if (candidate) {
      return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const filePath = fileURLToPath(url);
    const source = await readFile(filePath, "utf8");
    return { format: "json", shortCircuit: true, source };
  }

  if (url.endsWith(".ts") || url.endsWith(".tsx") || url.endsWith(".mts")) {
    const filePath = fileURLToPath(url);
    const source = await readFile(filePath, "utf8");
    const { outputText } = ts.transpileModule(source, {
      fileName: filePath,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true
      }
    });
    return { format: "module", shortCircuit: true, source: outputText };
  }

  return nextLoad(url, context);
}
