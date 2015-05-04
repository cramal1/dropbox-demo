# dropbox-demo

Drop Box Clone Demo - Week 1
Time Spent: 9 Hrs

[Completed] Required: Setup HTTP Server listening on port 8000
[Completed] Required: GET Request to get the file and directory contents
[Completed] Required: HEAD Request to get the file and directory contents
[Completed] Required: PUT request to create a new file and new directory
[Completed] Required: POST request to update an existing file
[Completed] Required: DELETE request to delete an existing file and directory
[Completed] Required: Add CLI to configure the server root directory
[Completed] Required: TCP Support to send the data to a client listening on a socket
[Completed] Required: Client - Connect to server using TCP
[Completed] Required: Client - Create, update and delete contents based on the data received from the server
[Completed] Required: Client - Add a CLI to configure the root directory of the client file system

[Not Done] Optional: Use HTTPS by default, and redirect from HTTP
[Not Done] Optional: Create, Update or Delete contents on the server when the corresponding packages are received from clients
[Not Done] Optional: Use fs.watch or chowkidar to sync contents automatically when the file system changes
[Not Done] Optional: Support conflict resolution
[Not Done] Optional: Support streaming video by respecting the Accept-Ranges header
[Not Done] Optional: Return an archive (e.g., zip, tar) when specified in the Accept header
[Not Done] Optional: Add FTP support so that an FTP client can be used to access the files

Directions to start:
Server: 
nodemon --exec babel-node -- --stage 1 --optional strict -- index.js --dirname <use your directory name. default - cwd>

Client:
nodemon --exec babel-node -- --stage 1 --optional strict -- client.js --dirname <use your directory name. defaul - /tmp>

Command Examples:
  npm start
  curl -v http://127.0.0.1:8000/foo2 -X GET
  curl -v http://127.0.0.1:8000/foo5 -X HEAD
  curl -v http://127.0.0.1:8000/foo6 -X PUT -d "Hello"
  curl -v http://127.0.0.1:8000/foo6/bar.js -X PUT -d "Hello"
  curl -v http://127.0.0.1:8000/foo6 -X POST -d "Hello World"
  curl -v http://127.0.0.1:8000/foo6/bar.js -X POST -d "Hello World"
  curl -v http://127.0.0.1:8000/foo6/bar.js -X DELETE
  curl -v http://127.0.0.1:8000/foo6 -X DELETE

Demo:

![]https://github.com/cramal1/dropbox-demo/blob/master/Dropbox-demo_v3.gif
