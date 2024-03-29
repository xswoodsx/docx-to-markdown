DOCX to MARKDOWN conversion

This is a script to convert docx documents to markdown using either pandoc, w2m, or mammoth. See links to each tool for further information on installation and requirements.

Create a folder a folder in the dir called converted-files

### Using Pandoc or w2m

The file-converter.rb function uses pandoc or w2m. You can run 
````bundle install```` to install the necessary gems. 

```ruby file-converter.rb "pandoc"```
or
````ruby file-convert.rb "w2m"````
to convert the files.

### Mammoth

Run ````npm i ````
to install all necessary packages

Once installed you can simply run

````node mammoth-word-to-md.js````

To convert to markdown. There are additional options you can add to Mammoth, see npm the page linked below

#### Links

Additional instructions information on **w2m** can be found [on their github](https://github.com/benbalter/word-to-markdown)

Additional information on **Pandoc-ruby** can be found [on their github](https://github.com/xwmx/pandoc-ruby)

Additional information on **Mammoth** can be found on their [npm page](https://www.npmjs.com/package/mammoth)

#### Additional info

If you want to convert using **w2m**, you'll also need to install LibreOffice.
You can find this [here](http://www.libreoffice.org/)

Both converters take an array, in this case folder names, loop through the folder nested within them and loop through each file in that subfolder.

For example

````./[CIP-NAME-folder]/[CIP-MODULE-folder]/[CIP-MATERIAL-DOCX-FILE]````

will spit out 

 `./converted-files/[CONVERSION-TOOL]/[CIP-NAME-folder]/[CIP-MODULE-folder]/[CIP-MATERIAL-MARKDOWN-FILE]`

