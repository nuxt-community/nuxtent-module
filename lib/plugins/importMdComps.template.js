function importAllMdComps (r) {
  r.keys().forEach(key => r(key))
}

importAllMdComps(
  require.context(<%= JSON.stringify(options.srcDirFromPlugin) %>, true, /\.comp\.md$/)
)
