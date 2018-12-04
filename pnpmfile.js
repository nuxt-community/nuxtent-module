module.exports = {
  hooks: {
    readPackage
  }
}

function readPackage(pkg, context) {
  if (pkg.name === 'nuxt' && pkg.version.startsWith('2.3')) {
    pkg.dependencies['@nuxt/vue-app'] = '^2.3.4'
    pkg.dependencies['@nuxt/vue-renderer'] = '^2.3.4'
    pkg.dependencies['webpack'] = 'latest'
    context.log('Fixing some NUXT dependencies')
  }
  if (pkg.name === '@nuxt/webpack' && pkg.version.startsWith('2.3')) {
    pkg.dependencies['babel-loader'] = '^8.0.4'
  }
  return pkg
}
