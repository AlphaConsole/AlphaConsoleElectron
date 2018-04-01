const http = require('http');
const {existsSync, writeFileSync} = require('fs');
const {server: WebSocketServer} = require('websocket');
const {Tail} = require('tail');

class FileWatcher {
  constructor(filePath, port) {
    this._filePath = filePath;
    this._port = port;
    // Create the tail file if it doesn't exist
    if (!existsSync(filePath)) {
      writeFileSync(filePath, '');
    }
    this.watch();
  }

  watch() {
    this.setupServer();
    this.setupTail();
  }

  setupServer() {
    // Create basic webserver - required for the WebSocketServer
    this.server = http.createServer((_, res) => res.end());
    this.server.listen(this._port, () => console.log(`Server is listening on ${this._port}`));

    // Create WebSocketServer
    this.ws = new WebSocketServer({httpServer: this.server});
    this.ws.on('request', request => {
      console.log(`New Connection on ${new Date()} from ${request.origin}`);
      const connection = request.accept(null, request.origin);
      connection.on('message', () => connection.send('This server does not accept data'));
    });
  }

  // Tail file for changes and send to all existing connections
  setupTail() {
    this.tail = new Tail(this._filePath);
    this.tail.on('line', data => {
      this.ws.connections.forEach(connection => connection.send(data));
    });
    this.tail.watch();
  }

  shutdown() {
    this.tail.unwatch();
    this.tail = null;
    this.ws.shutdown();
    this.ws = null;
    this.server.close();
    this.server = null;
  }
}

module.exports = {FileWatcher};
