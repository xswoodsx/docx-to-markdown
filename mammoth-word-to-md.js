import { readdir, mkdir } from "fs/promises";
import {
  removeHiddenFiles,
  writeFileToMarkdown,
  parseMarkdown, convertToHtmlUsingMammoth,
} from "./conversion-utils.js";

const coreInductionProgrammes = ["Teach-First"];
// const coreInductionProgrammes = ["Ambition", "EDT", "Teach-First", "UCL"];

async function findAndCreateFolders() {
  for await (const programme of coreInductionProgrammes) {
    mkdir(`./converted-files/mammoth-saved-md/${programme}`).then(async () => {
      const folders = await readdir(`./${programme}`);
      for await (const folder of removeHiddenFiles(folders)) {
        mkdir(`./converted-files/mammoth-saved-md/${programme}/${folder}`).then(
          async () => {
            await convertAndWriteFilesToMarkdown(programme, folder);
          }
        );
      }
    });
  }
}

async function convertAndWriteFilesToMarkdown(programme, folder) {
  try {
    const files = await readdir(`./${programme}/${folder}`);
    for await (const file of removeHiddenFiles(files)) {
      convertToHtmlUsingMammoth(programme, folder, file).then(async (result) => {
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
