const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const paramCase = require('param-case')
const fm = require('front-matter')
const yamlParser = require('js-yaml')
const mdParser = require('markdown-it')({
  preset: 'default',
  html: true,
  typographer: true,
  linkify: true,
  // highlight: renderHighlight
})

export default function parseFile(meta) {
  const { filePath, fileName } = meta
  const source = readFileSync(filePath).toString()
  if (isMdFile(fileName)) return compileMd(source, meta)
  else if (isYamlFile(fileName)) return compileYaml(source)
}

function compileMd(source, { dirName, section, fileName }) {
  const { attributes, body } = fm(source)
  if (isCompMdFile(fileName)) {
    const relativePath = '.' +  join(dirName, section, fileName)
    return {
      ...attributes,
      body: { relativePath } // body is compiled by loader and imported seperately using relative path
    }
  } else {
    return {
      ...attributes,
      body: mdParser.render(body)
    }
  }
}

function compileYaml(source) {
  return yamlParser.safeLoad(source)
}


function isCompMdFile(fileName) {
  return fileName.search(/\.comp\.md/) > -1
}


function isMdFile(fileName) {
  return fileName.search(/\.md/) > -1
}

function isYamlFile(fileName) {
  return fileName.search(/\.yaml/) > -1
}
