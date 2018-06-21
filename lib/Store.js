

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')


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

  writeFile(filePath, buff) {
    const zipStream = zlib.createGzip({
      level: zlib.constants.Z_BEST_COMPRESSION
    })
    const writeStream = fs.createWriteStream(filePath)
    zipStream.pipe(writeStream)
    zipStream.write(buff)
    zipStream.end()
    return zipStream
  }

  securelyResolveFileName(fileName) {
    fileName = path.resolve('/', fileName)
    return path.join(this._dataFolder, fileName)
  }
    
  appendFile(fileName, stringData, callback) {
    stringData = stringData.replace(/\n/g, ' ') + '\n'
    fileName = fileName
    const filePath = this.securelyResolveFileName(fileName)
    const dirPath = path.dirname(filePath)
    this.createDirectoryIfNotExists(dirPath, (err) => {
      if(err) {
        console.error(err)
        return callback(err)
      }

      fs.appendFile(filePath, stringData, {
        mode: '0660',
        flag: 'a+'
      }, (err) => {
        if(err) {
          console.error(err)
        }
        callback(err)
      })

    })
  }

}

module.exports = Store