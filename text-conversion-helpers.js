import visit from "unist-util-visit";

export function fixBoldText() {
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

export function fixHeadingsToAddBreakAfterString() {
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

export function removeEmptyLinks() {
  return (tree) => {
    visit(tree, "link", (node, index, parent) => {
      if (node.url === "") {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}

export function removeEmptyCells() {
  return (tree) => {
    visit(tree, "tableCell", (node, index, parent) => {
      if (node.children.length == 0) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}

export function removeEmptyRows() {
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

export function addNewLinesToListsInTables() {
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

export function removeBreaksFromTextHeadings() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      parent.children = parent.children.filter(
        (child) => child.type !== "break"
      );
    });
  };
}

export function addBreakAfterBoldInTableCells() {
  return (tree) => {
    visit(tree, "strong", (node, index, parent) => {
      if (parent.children.length === 1 && node.children.length > 0) {
        node.children.forEach((child) => (child.value += "<br />"));
      }
    });
  };
}
