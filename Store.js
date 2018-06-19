

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')


class Store {
  constructor(options) {
    options = options || {}
    this._dataFolder = options.dataFolder || path.join(__dirname, 'data')
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

  readFile(filePath) {
    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => {
      if(err.code === 'ENOENT') {
        readStream.unpipe(gunzipStream)
        gunzipStream.destroy()
      } else {
        throw err
      }
    })
    const gunzipStream = zlib.createGunzip()
    readStream.pipe(gunzipStream)
    return gunzipStream
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
    
  appendFile(fileName, stringData, callback) {
    stringData = stringData.replace(/\n/g, ' ')
    fileName = fileName + '.gz'
    const filePath = path.join(this._dataFolder, fileName)
    const dirPath = path.dirname(filePath)
    this.createDirectoryIfNotExists(dirPath, (err) => {
      if(err) {
        console.error(err)
        return callback(err)
      }

      const fileStream = this.readFile(filePath)
      fileStream.on('error', (err) => {
        console.error(filePath, err)
      })
      let fileData = []
      let lastLine = ''
      fileStream.on('data', (chunk) => {
        lastLine += chunk.toString('utf8')
        const lines = lastLine.split('\n')
        if(lines.length > 1) {
          lastLine = lines[lines.length-1] ? lines[lines.length-1] : lines[lines.length-2]
        }
        fileData.unshift(chunk)
      })
      fileStream.on('end', () => {
      })
      fileStream.on('unpipe', () => {
        if(lastLine !== stringData) { // Do not repeat the same line as the last one we got
          fileData.push(Buffer.from(stringData + '\n', 'utf8'))
          this.writeFile(filePath, Buffer.concat(fileData))
        } else {
          // console.info('File left unchanged', fileName)
        }
        callback()
      })
    })
  }

}

module.exports = Store