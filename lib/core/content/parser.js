const { readFileSync } = require('fs')
const { join } = require('path')
const fm = require('front-matter')
const yamlParser = require('js-yaml')
const mdParser = require('markdown-it')({
  preset: 'default',
  html: true
  // highlight: renderHighlight
})

export default function parseFile(dirPath, fileName) {
  const filePath = join(dirPath, fileName)
  const source = readFileSync(filePath).toString()
  if (isMdFile(fileName)) return parseMd(source)
  else if (isYamlFile(fileName)) return parseYaml(source)
}


function parseMd(source) {
  const { attributes, body } = fm(source)
  return {
    ...attributes,
    body: mdParser.render(body) // md -> html
  }
}

function parseYam(source) {
  return yamlParser.safeLoad(source)
}

function isMdFile(fileName) {
  return fileName.search(/\.md/) > -1
}

function isYamlFile(fileName) {
  return fileName.search(/\.yaml/) > -1
}
