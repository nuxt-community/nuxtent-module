const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const paramCase = require('param-case')
const fm = require('front-matter')
const yamlParser = require('js-yaml')
const initMdParser = (highlight) => require('markdown-it')({
  preset: 'default',
  html: true,
  typographer: true,
  linkify: true,
  highlight
})

export default function parseFile(meta, options) {
  const { filePath, fileName } = meta
  const source = readFileSync(filePath).toString()
  if (fileName.search(/\.md/) > -1) return compileMd(source, meta, options)
  else if (fileName.search(/\.yaml/) > -1) return yamlParser.safeLoad(source)
}

function compileMd(source, { dirName, section, fileName }, { mod }) {
  const { attributes, body } = fm(source)

  if (fileName.search(/\.comp\.md/) > -1) {
    const relativePath = '.' +  join(dirName, section, fileName)
    return {
      ...attributes,
      body: { relativePath } // body is compiled by loader and imported seperately using relative path
    }
  } else {
    return {
      ...attributes,
      body: initMdParser(mod.highlight).render(body)
    }
  }
}
