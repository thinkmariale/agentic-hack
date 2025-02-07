import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import * as glob from "glob";

// automatically find all files in the src/lit-actions/src directory
const ENTRY_POINTS = glob.sync("./src/actions/**/*.ts");

const configs = ENTRY_POINTS.map((entryPoint) => {
  // Read the content and extract the comment block
  const content = fs.readFileSync(entryPoint, "utf8");
  const commentBlock = content.match(/\/\*\*([\s\S]*?)\*\//)?.[1];

  if (!commentBlock) return { entryPoint };

  // Find all lines containing 'inject' or 'inject:'
  const injectLines = commentBlock
    .split("\n")
    .filter((line) => line.includes("inject"));

  // Extract the injected values
  const injectedValues = injectLines.map((line) => {
    const match = line.match(/inject:?\s*([^\s]+)/);
    return match ? match[1] : null;
  });

  // for each injected value, check if the file exist
  injectedValues.forEach((injectedValue) => {
    if (injectedValue && !fs.existsSync(injectedValue)) {
      throw new Error(`❌ File ${injectedValue} does not exist`);
    }
  });

  return {
    entryPoint,
    ...(injectedValues.length > 0 && { injectedValues }),
  };
});

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

const wrapIIFEInStringPlugin = {
  name: "wrap-iife-in-string",
  setup(build) {
    // Ensure write is set to false so our plugin will always receive outputFiles
    build.initialOptions.write = false;

    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error("Build failed with errors:", result.errors);
        return;
      }

      result.outputFiles.forEach((outputFile) => {
        let content = outputFile.text;
        // Ensure the output directory exists
        const outputPath = path.resolve(outputFile.path);
        ensureDirectoryExistence(outputPath);

        // Write the modified content back to the output file
        fs.writeFileSync(outputPath, content);
      });
    });
  },
};
const shimFiles = glob.sync("./shims/**/*.shim.js");
const promises = configs.map((config) => {
  return esbuild.build({
    entryPoints: [config.entryPoint],
    bundle: true,
    minify: false, // Up to user to turn it on/off. Default off.
    treeShaking: true,
    outdir: "./actions",
    external: ["ethers"],
    plugins: [wrapIIFEInStringPlugin],
    ...(config?.injectedValues && { inject: config?.injectedValues }),
    inject: shimFiles,
  });
});

// resolve all promises
const startTime = Date.now();

Promise.all(promises)
  .then((results) => {
    results.forEach((result) => {
      // Check if outputFiles is defined and is an array
      if (result.outputFiles && Array.isArray(result.outputFiles)) {
        result.outputFiles.forEach((file) => {
          const bytes = file.contents.length;
          const mbInBinary = (bytes / (1024 * 1024)).toFixed(4);
          const mbInDecimal = (bytes / 1_000_000).toFixed(4);
          const fileName = path.relative(process.cwd(), file.path);
          console.log(`🗂️  File: ${fileName}`);
          console.log(
            `   Size: ${mbInDecimal} MB (decimal) | ${mbInBinary} MB (binary)`
          );
        });
      }
    });

    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000; // Convert to seconds
    const msg = `✅ Lit actions built successfully in ${buildTime.toFixed(
      2
    )} seconds`;
    console.log(
      msg
        .split("")
        .map((_char) => "=")
        .join("")
    );
    console.log(msg);
  })
  .catch((error) => {
    console.error("❌ Error building lit actions: ", error);
    process.exit(1);
  });
