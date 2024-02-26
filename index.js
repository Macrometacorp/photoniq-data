const core = require("@actions/core");
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const BASE_PATH = "./data";
const VERSION_PATH = `${BASE_PATH}/version.json`;

const streamPipeline = promisify(pipeline);

async function downloadFile(fileName, url) {
  const outputPath = `${BASE_PATH}/${fileName}`;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Unexpected response ${response.statusText}`);

  const writeStream = fs.createWriteStream(outputPath);

  const writeStreamPromise = new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`File ${fileName} has been written successfully.`);
      resolve();
    });
    writeStream.on("error", (error) => {
      console.error("An error occurred with the write stream:", error.message);
      reject(error);
    });
  });

  await streamPipeline(response.body, writeStream);
  return writeStreamPromise;
}

/**
 * Starts the process of checking and downloading new versions based on the provided mappings of existing versions and download URLs.
 *
 * @param {Object.<string, string>} existingVersions - An object mapping item names to their current versions. The keys represent the name of the item, and the values represent their respective versions.
 * @param {Object.<string, string>} downloadItems - An object mapping item names to their download URLs. The keys represent the name of the item, and the values represent the URLs from which they can be downloaded.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const start = async (versions, downloadItems) => {
  try {
    console.log("Existing Versions: ", JSON.stringify(versions));
    const versionNow = new Date().toISOString();
    console.log("New Version: ", versionNow);

    const promises = [];

    Object.keys(downloadItems).forEach((fileName) => {
      const url = downloadItems[fileName];
      promises.push(
        downloadFile(fileName, url)
          .then(() => ({ name: fileName, status: true }))
          .catch(() => ({
            name: fileName,
            status: false,
          }))
      );
    });

    const result = await Promise.allSettled(promises);

    result.forEach((res) => {
      const {
        value: { name, status },
      } = res;

      // Check and log if status is false, indicating a failed download.
      if (status === false) {
        console.error(`Error downloading ${name}`);
      }

      // not saving if undefined, hence null in case of bottom values
      versions[name] = status === true ? versionNow : versions[name] ?? null;
      console.log(name, status);
    });

    fs.writeFileSync(VERSION_PATH, JSON.stringify(versions));

    console.log(`Completed: ${JSON.stringify(versions)}`);
  } catch (error) {
    console.error("Error happened!!!");
    core.setFailed(error.message);
  }
};

let existingVersions = {}; // Default to an empty object

try {
  const fileContents = fs.readFileSync(VERSION_PATH, "utf8");
  existingVersions = JSON.parse(fileContents);
} catch (error) {
  console.warn(
    "Error reading the file, returning an empty object:",
    error.message
  );
}

try {
  const downloadItems = JSON.parse(process.env.DOWNLOAD_ITEMS);

  start(existingVersions, downloadItems);
} catch {
  core.setFailed("Could not get 'downloadItems'");
}
