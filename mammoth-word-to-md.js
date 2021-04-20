import mammoth from "mammoth";
import fs from "fs";
import fsPromises from "fs/promises";
import unified from "unified";
import parseHTML from "rehype-parse";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import prettier from "prettier";

let coreInductionProgrammes = ["Ambition"];

async function convertToMarkdown() {
  coreInductionProgrammes.forEach((programme) => {
    fsPromises
      .mkdir(`./mentormats/mammoth-saved-md/${programme}`)
      .then(async () => {
        const folders = await fsPromises.readdir(`./mentormats/${programme}`);
        for await (const folder of folders)
          fsPromises
            .mkdir(`./mentormats/mammoth-saved-md/${programme}/${folder}`)
            .then(async () => {
              const files = await fsPromises.readdir(
                `./mentormats/${programme}/${folder}`
              );
              for await (const file of files)
                mammoth
                  .convertToHtml({
                    path: `./mentormats/${programme}/${folder}/${file}`,
                  })
                  .then(async (result) => {
                    console.log("before processing html");
                    const markdown = await parseMarkdown(result);
                    console.log("after processing html");
                    fsPromises.writeFile(
                      `./mentormats/mammoth-saved-md/${programme}/${folder}/${file.replace(
                        ".docx",
                        ".mdx"
                      )}`,
                      markdown
                    );
                  })
                  .then(() => {
                    console.log("it was saved");
                  });
            });
      });
  });
}

function parseMarkdown(data) {
  return new Promise((resolve, reject) => {
    unified()
      .use(parseHTML, {
        fragment: true,
        emitParseErrors: true,
        duplicateAttribute: false,
      })
      .use(rehype2remark)
      .use(stringify, {
        fences: true,
        listItemIndent: 1,
        gfm: false,
        pedantic: false,
      })
      .process(data, (err, dirtyMarkdown) => {
        console.log("in the process");
        if (err) {
          reject(err);
        } else {
          // actual mdx string
          let content = dirtyMarkdown.value;
          content = content.replace(/(?<=https?:\/\/.*)\\_(?=.*\n)/g, "_");
          resolve(prettier.format(content, { parser: "mdx" }));
        }
      });
  });
}

convertToMarkdown();
