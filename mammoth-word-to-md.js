import mammoth from "mammoth"
import fs from 'fs';
import unified from 'unified';
import parseHTML from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import stringify from 'remark-stringify';
import prettier from 'prettier';


let coreInductionProgrammes = ["Ambition", "EDT", "Teach-First", "UCL"]


 function convertToMarkdown() {
    coreInductionProgrammes.forEach((programme) => {
        fs.readdir((`./mentormats/${programme}`), (err, folder) => {
            fs.mkdir((`./mentormats/mammoth-saved-html/${programme}`), () => {
                folder = folder.filter(f => !f.startsWith("."))
                folder.forEach((block) => {
                    fs.readdir((`./mentormats/${programme}/${block}`), (err, files) => {
                        files = files.filter(f => !f.startsWith("."))
                        files.map((file) => {
                                mammoth.convertToHtml({path: `./mentormats/${programme}/${block}/${file}`}).then((result) => {
                                    const markdown = parseMarkdown(result)
                                    if (fs.existsSync(`./mentormats/mammoth-saved-html/${programme}/${block}`)) {

                                        fs.writeFile(`./mentormats/mammoth-saved-html/${programme}/${block}/${file.replace(".docx", ".md")}`, markdown, (err) => {
                                            if (err) throw err
                                            else console.log("it was saved")
                                        })
                                    } else fs.mkdir((`./mentormats/mammoth-saved-html/${programme}/${block}`), () => {
                                        fs.writeFile(`./mentormats/mammoth-saved-html/${programme}/${block}/${file.replace(".docx", ".md")}`, markdown, (err) => {
                                            if (err) throw err
                                            else console.log("it was saved")
                                        })
                                    })
                                }).done()
                        })
                    })
                })
            })
        })
    })
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
                if (err) {
                    reject(err);
                } else {
                    // actual mdx string
                    let content = dirtyMarkdown.value;
                    content = content.replace(
                        /(?<=https?:\/\/.*)\\_(?=.*\n)/g,
                        '_',
                    );
                    resolve(prettier.format(content, {parser: 'mdx'}));
                }
            });
    });
}

convertToMarkdown()