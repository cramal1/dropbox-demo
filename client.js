let fs = require('fs')
let mkdirp = require('mkdirp')
require('songbird')
let rimraf = require('rimraf')

let jsonovertcp = require('json-over-tcp')

const PORT = 8099
const FILE_TYPE_DIR = 'dir'
const OPERATION_CREATE = 'create'
const OPERATION_UPDATE = 'update'
const OPERATION_DELETE = 'delete'

async function doesFileExist(filePath, processData){
  console.log('Filepath: ' + filePath)
  await fs.promise.stat(filePath)
  .then(
   () => {
     processData.filexists = true
   },
   () => {
     processData.filexists = false
   })
}

async function handleCreate(data){
  let filePath = '/tmp' + data.path
  let processData = {}
  await doesFileExist(filePath, processData)

  if (processData.filexists === true){
    console.log('File exists. Exiting now.')
    return
  } else {
    console.log('File doesnt exist. Continuing to create the file')
  }

  // Write the contents to a file
  if (data.type === FILE_TYPE_DIR) {
    await mkdirp.promise(filePath)
  } else {
     await fs.promise.writeFile(filePath, data.contents, 'utf-8')
    console.log('File created successfully!!')
  }
}

async function handleUpdate(data){
  let filePath = '/tmp' + data.path
  if (data.type === FILE_TYPE_DIR) {
     console.log('File is a directory. Exiting now.')
     return
  }
  // Write the contents to a file
  await fs.promise.truncate(data.path, 0)
  await fs.promise.writeFile(filePath, data.contents, 'utf-8')
  console.log('File updated successfully!!')
}

async function handleDelete(data){
  let filePath = '/tmp' + data.path
  let processData = {}
  await doesFileExist(filePath, processData)
  if(processData.filexists !== true){
    console.log('File doesnt exist locally. Exiting now')
    return
  }

  if(data.type === FILE_TYPE_DIR){
      await rimraf.promise(filePath)
  } else {
    await fs.promise.unlink(filePath)
  }
}

function newConnectionHandler(socket){
  socket.on('data', (data) => {
    console.log('Data from server: ' + data)
    let dataFromServer = JSON.parse(data)
    console.log('dataFromServer.action: ' + dataFromServer.action)
    console.log('OPERATION_DELETE: ' + OPERATION_DELETE)

    if(dataFromServer.action === OPERATION_CREATE){
      handleCreate(dataFromServer)
    } else if (dataFromServer.action === OPERATION_UPDATE) {
      handleUpdate(dataFromServer)
    } else if (dataFromServer.action === OPERATION_DELETE) {
      handleDelete(dataFromServer)
    }else {
      console.log('Unknown operation request from the server. Exiting now!')
      return
    }
  })

}

let server = jsonovertcp.createServer(PORT).listen(PORT)

console.log(`TCP Client listening @ http://127.0.0.1:${PORT}`)
server.on('connection', newConnectionHandler)
