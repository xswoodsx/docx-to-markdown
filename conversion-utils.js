import mammoth from "mammoth";
import { writeFile } from "fs/promises";
import unified from "unified";
import parseHTML from "rehype-parse";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import prettier from "prettier";
import {
  removeEmptyRows,
  removeEmptyCells,
  fixBoldText,
  addBreakAfterBoldInTableCells,
  fixHeadingsToAddBreakAfterString,
  removeEmptyLinks,
  addNewLinesToListsInTables,
  removeBreaksFromTextHeadings,
} from "./text-conversion-helpers.js";

export const removeHiddenFiles = (path) => {
  return path.filter((p) => !p.startsWith("."));
};

export const convertToHtmlUsingMammoth = (programme, folder, file) => {
  let imageIndex = 0;
  const programmeFolderFileOfImage = `./images/${programme}/${folder}-${file.replace(
    ".docx",
    ""
  )}`;

  let options = {
    path: `./${programme}/${folder}/${file}`,
    convertImage: mammoth.images.imgElement(function (image) {
      return image.read("base64").then(function (imageBuffer) {
        const suffix = image.contentType.split("/").pop();
        const fileName = `${programmeFolderFileOfImage}-image${imageIndex}.${suffix}`;
        imageIndex++;
        writeFile(fileName, imageBuffer, "base64");
        console.log("image save success.", fileName);
        return {
          src: fileName,
        };
      });
    }),
    styleMap: [
      "p[style-name='List Paragraph'] => ul > li:fresh",
      "p[style-name='Text Body'] => ol > li:fresh",
      // "p[style-name='Heading 2'] => p:fresh > b:fresh",
    ],
  };

  return mammoth.convertToHtml(
    {
      path: `./${programme}/${folder}/${file}`,
    },
    options
  );
};

export const writeFileToMarkdown = (markdown, programme, folder, file) => {
  return writeFile(
    `./converted-files/mammoth-saved-md/${programme}/${folder}/${file.replace(
      ".docx",
      ".mdx"
    )}`,
    markdown
  );
};

export const parseMarkdown = (data) => {
  return new Promise((resolve, reject) => {
    unified()
      .use(parseHTML, {
        fragment: true,
        emitParseErrors: true,
        duplicateAttribute: false,
      })
      .use(rehype2remark)
      .use(removeBreaksFromTextHeadings)
      .use(fixBoldText)
      .use(fixHeadingsToAddBreakAfterString)
      .use(removeEmptyLinks)
      .use(removeEmptyCells)
      .use(removeEmptyRows)
      .use(addNewLinesToListsInTables)
      .use(addBreakAfterBoldInTableCells)
      .use(stringify, {
        fences: true,
        listItemIndent: 1,
        gfm: false,
        pedantic: false,
      })
      .process(data.value, (err, dirtyMarkdown) => {
        if (err) {
          reject(err);
        } else {
          // actual mdx string
          let content = dirtyMarkdown.contents;

          content = content.replace(/(?<=https?:\/\/.*)\\_(?=.*\n)/g, "_").replace(/&lt;/g, "<").replace(/\\[*]\\[*]/g, "").replace(/\\[*]/g, "")
          resolve(prettier.format(content, { parser: "mdx" }));
        }
      });
  });
};
