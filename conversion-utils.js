import mammoth from "mammoth";
import { writeFile } from "fs/promises";
import unified from "unified";
import parseHTML from "rehype-parse";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import prettier from "prettier";

export const removeHiddenFiles = (path) => {
  return path.filter((p) => !p.startsWith("."));
};

export const convertUsingMammoth = (programme, folder, file) => {
  return mammoth.convertToHtml({
    path: `./mentormats/${programme}/${folder}/${file}`,
  });
};

export const writeFileToMarkdown = (markdown, programme, folder, file) => {
  return writeFile(
    `./mentormats/mammoth-saved-md/${programme}/${folder}/${file.replace(
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
          content = content.replace(/(?<=https?:\/\/.*)\\_(?=.*\n)/g, "_");
          resolve(prettier.format(content, { parser: "mdx" }));
        }
      });
  });
};
