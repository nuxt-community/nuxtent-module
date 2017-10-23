// @flow

class ConfigFile {
  _fileName: string
  _config: Object

  constructor(fileName: string) {
    this._fileName = fileName
    this._config = {}
    this.readFile()
  }

  readFile(): void {
    try {
      // $FlowFixMe the require must be dynamic
      this._config = require(this._fileName)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        this._config = {}
        return
      }
      throw new Error(`[Invalid Nuxtent configuration file] ${err}`)
    }
  }

  // $FlowFixMe no side-effect
  get config(): Object {
    return this._config
  }
}

export default ConfigFile
