/**
 * Tiny TypeScript loader so the verification script can run under plain node.
 *
 * There is no tsx/ts-node in this repo and the checks must not need one: the
 * benchmark and compatibility modules are plain TypeScript with no runtime
 * dependencies, so the compiler that is already in node_modules is enough to
 * transpile them on the fly and hand them to node's CommonJS loader.
 *
 * It also maps the `@/` path alias, which only tsc knows about.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(ROOT, request.slice(2));
  return originalResolve.call(this, request, ...rest);
};

require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      resolveJsonModule: true,
      isolatedModules: true,
    },
  });
  if (diagnostics && diagnostics.length) {
    for (const d of diagnostics) {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, " ");
      if (d.file && d.start != null) {
        const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
        console.error(`${path.relative(ROOT, filename)}:${line + 1}:${character + 1} ${msg}`);
      } else {
        console.error(msg);
      }
    }
  }
  module._compile(outputText, filename);
};

module.exports = { ROOT };
