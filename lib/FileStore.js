

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')


class Store {
  constructor(options) {
    options = options || {}
    this._dataFolder = options.dataFolder || process.env.DATA_FOLDER || path.join(__dirname, '..', 'data')
    this._processedDirectories = {}
  }

  createDirectoryIfNotExists(dirPath, callback) {
    if(this._processedDirectories[dirPath]) {
      return callback()
    } else {
      mkdirp(dirPath, {mode: '0770'}, (err) => {
          if (err) {
            console.error(err)
            callback(err)
          } else {
            this._processedDirectories[dirPath] = true
            callback()
          }
      })
    }
  }

  listDirectory(dirPath, callback) {

    dirPath = path.resolve('/', dirPath)
    dirPath = path.join(this._dataFolder, dirPath)
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(err)
      }
      callback(err, files)
    })
  }

  readFile(filePath) {
    const readStream = fs.createReadStream(filePath);
    return readStream
  }

  securelyResolveFileName(fileName) {
    fileName = path.resolve('/', fileName)
    return path.join(this._dataFolder, fileName)
  }

}

module.exports = Store