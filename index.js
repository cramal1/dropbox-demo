let fs = require('fs')
let path = require('path')
let express = require('express')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let bluebird = require('bluebird')

require('songbird')

bluebird.longStackTraces()

const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 8000
const ROOT_DIR = path.resolve(process.cwd())

let app = express()
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))

function setFileAttributes(req, res, next){
  let filePath = path.resolve(path.join(ROOT_DIR, req.url))
  req.filePath = filePath
  if(req.filePath.indexOf(ROOT_DIR) !== 0){
    res.send(400, 'Invalid Request!')
    return
  }

  fs.promise.stat(filePath)
  .then(stat => req.stat = stat, () => req.stat = null)
  .nodeify(next)
}

function sendHeaders(req, res, next){
  nodeify(async ()=> {
    if(req.stat.isDirectory()){
       let files = await fs.promise.readdir(req.filePath)
       res.body = JSON.stringify(files)
       res.setHeader('Content-Length', res.body.length)
       res.setHeader('Content-Type', 'application/json')
       return
    }

    res.setHeader('Content-Length', req.stat.size)
    let contentType = mime.contentType(path.extname(req.filePath))
    res.setHeader('Content-Type', contentType)
  }(), next)
}

function setDirDetails(req, res, next){
  let endsWithSlash = req.filePath.charAt(req.filePath.length - 1) === path.sep
  let hasExt = path.extname(req.filePath) !== ''
  req.isDir = endsWithSlash || !hasExt
  req.dirPath = req.isDir ? req.filePath : path.dirname(req.filePath)
  console.log('Slash present?' + req.filePath.charAt(req.filePath.length - 1))
  console.log('path.sep' + path.sep)
  console.log('endsWithSlash: ' + endsWithSlash)
  console.log('hasExt: ' + hasExt)
  console.log('req.filePath: ' + req.filePath)
  console.log('req.dirPath: ' + req.dirPath)
  next()
}

app.get('*', setFileAttributes, sendHeaders, (req, res) => {
  if(res.body){
    res.json(res.body)
    return
  }
  fs.createReadStream(req.filePath).pipe(res)

})

app.head('*', setFileAttributes, sendHeaders, (req, res) => res.end())


app.delete('*', setFileAttributes, (req, res, next) => {
  async () => {
    if(!req.stat){
      return res.send(400, 'File not found!!')
    }

    if(req.stat.isDirectory()){
      await rimraf.promise(req.filePath)
    } else {
      await fs.promise.unlink(req.filePath)
    }
   res.end()
  }().catch(next)
})

app.put('*', setFileAttributes, setDirDetails, (req, res, next) => {
  async ()=> {
    if (req.stat) return res.send(405, 'File Exists')

    await mkdirp.promise(req.dirPath)
    if (!req.isDir){
      req.pipe(fs.createWriteStream(req.filePath))
    }
    res.end()
  }().catch(next)

})

app.post('*', setFileAttributes, setDirDetails, (req, res, next) => {
  async ()=> {
    if (!req.stat) return res.send(405, 'File Doesnt Exist')
    if (req.isDir) return res.send(405, 'Path is a directory')

    await fs.promise.truncate(req.filePath, 0)
    req.pipe(fs.createWriteStream(req.filePath))
    res.end()
  }().catch(next)

})
