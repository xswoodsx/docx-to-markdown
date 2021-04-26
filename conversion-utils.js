import mammoth from "mammoth";
import { writeFile } from "fs/promises";
import unified from "unified";
import parseHTML from "rehype-parse";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import prettier from "prettier";
import visit from "unist-util-visit";

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
      "comment-reference => sup",
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
          content = content.replace(/&lt;/g, "<");
          resolve(prettier.format(content, { parser: "mdx" }));
        }
      });
  });
};

function fixBoldText() {
  return (tree) => {
    visit(tree, "strong", (node) => {
      node.children.map((child) => {
        if (child.value) {
          child.value = child.value.trim();
        }
      });
    });
  };
}
function fixHeadingsToAddBreakAfterString() {
  return (tree) => {
    visit(tree, "heading", (node) => {
      node.children.map((child) => {
        if (child.value) {
          child.value = child.value.trim();
          child.value += "<br />";
        }
      });
    });
  };
}

function removeEmptyLinks() {
  return (tree) => {
    visit(tree, "link", (node, index, parent) => {
      if (node.url === "") {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}

function removeEmptyCells() {
  return (tree) => {
    visit(tree, "tableCell", (node, index, parent) => {
      if (node.children.length == 0) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}

function removeEmptyRows() {
  return (tree) => {
    visit(tree, "table", (node, index, parent) => {
      if (parent.type === "tableCell") {
        node.type = "list";
        node.children = node.children.filter(
          (child) => child.children.length > 0
        );
      }
    });
  };
}

function addNewLinesToListsInTables() {
  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (node.children.length > 1) {
        node.children[node.children.length - 1].value += "<br />";
      } else if (node.children.length === 1) {
        node.children[0].value += "<br />";
      }
    });
  };
}

function removeBreaksFromTextHeadings() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      parent.children = parent.children.filter((child) => child.type !== "break")
    })
  }
}