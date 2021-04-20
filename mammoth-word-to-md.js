import mammoth from "mammoth"
import fs from 'fs';
import unified from 'unified';
import parseHTML from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import stringify from 'remark-stringify';
import prettier from 'prettier';


let coreInductionProgrammes = ["Ambition"]


 async function convertToMarkdown() {
    coreInductionProgrammes.forEach((programme) => {
        fs.readdir((`./mentormats/${programme}`), (err, folder) => {
            fs.mkdir((`./mentormats/mammoth-saved-md/${programme}`), () => {
                folder = folder.filter(f => !f.startsWith("."))
                folder.forEach((block) => {
                    fs.readdir((`./mentormats/${programme}/${block}`), (err, files) => {
                        files = files.filter(f => !f.startsWith("."))
                        files.map((file) => {
                                mammoth.convertToHtml({path: `./mentormats/${programme}/${block}/${file}`}).then(async(result) => {
                                    console.log("before processing html")
                                    const markdown = await parseMarkdown(result)
                                    console.log("after processing html")
                                    if (fs.existsSync(`./mentormats/mammoth-saved-md/${programme}/${block}`)) {

                                        fs.writeFile(`./mentormats/mammoth-saved-md/${programme}/${block}/${file.replace(".docx", ".mdx")}`, markdown, (err) => {
                                            if (err) throw err
                                            else console.log("it was saved")
                                        })
                                    } else fs.mkdir((`./mentormats/mammoth-saved-md/${programme}/${block}`), () => {
                                        fs.writeFile(`./mentormats/mammoth-saved-md/${programme}/${block}/${file.replace(".docx", ".mdx")}`, markdown, (err) => {
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
                console.log("in the process")
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