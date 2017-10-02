class ConfigFile {
  constructor(fileName) {
    this._fileName = fileName
    this._config = {}
    this.readFile()
  }

  readFile() {
    try {
      this._config = require(this._fileName)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        this._config = {}
        return
      }
      throw new Error(`[Invalid Nuxtent configuration file] ${err}`)
    }
  }

  get config() {
    return this._config
  }
}

export default ConfigFile
