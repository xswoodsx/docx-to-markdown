import { readdir, mkdir } from "fs/promises";
import {
  removeHiddenFiles,
  convertUsingMammoth,
  writeFileToMarkdown,
  parseMarkdown,
} from "./conversion-utils.js";

const coreInductionProgrammes = ["Teach-First"];
// const coreInductionProgrammes = ["Ambition", "EDT", "Teach-First", "UCL"];

async function findAndCreateFolders() {
  for await (const programme of coreInductionProgrammes) {
    mkdir(`./mentormats/mammoth-saved-md/${programme}`).then(async () => {
      const folders = await readdir(`./mentormats/${programme}`);
      for await (const folder of removeHiddenFiles(folders)) {
        mkdir(`./mentormats/mammoth-saved-md/${programme}/${folder}`).then(
          async () => {
            await convertFilesInSubDirectoriesToMarkdown(programme, folder);
          }
        );
      }
    });
  }
}

async function convertFilesInSubDirectoriesToMarkdown(programme, folder) {
  try {
    const files = await readdir(`./mentormats/${programme}/${folder}`);
    for await (const file of removeHiddenFiles(files)) {
      convertUsingMammoth(programme, folder, file).then(async (result) => {
        const markdown = await parseMarkdown(result);
        writeFileToMarkdown(markdown, programme, folder, file).then(() =>
          console.log("it was saved")
        );
      });
    }
  } catch (err) {
    console.log(err);
  }
}

findAndCreateFolders();
