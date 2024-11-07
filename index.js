const net = require("net");
const { connected } = require("process");
const Parser = require("redis-parser");

const store = {};

const server = net.createServer((connection) => {
  console.log("Client connected");

  const parser = new Parser({
    returnReply: (reply) => {
      const command = reply[0].toLowerCase();
      switch (command) {
        case "set":
          const key = reply[1];
          const value = reply[2];
          store[key] = value;
          connection.write("+OK\r\n");
          break;

        case "get":
          const getKey = reply[1];
          const getValue = store[getKey];
          if (!getValue) {
            connection.write("$-1\r\n");
          } else {
            connection.write(`$${getValue.length}\r\n${getValue}\r\n`);
          }
          break;

        default:
          connection.write("-ERR Unknown command\r\n");
          break;
      }
    },
    returnError: (err) => {
      console.log("=>", err);
      connection.write("-ERR " + err.message + "\r\n");
    },
  });

  connection.on("data", (data) => {
    parser.execute(data);
  });

  connection.on("end", () => {
    console.log("Client disconnected");
  });
});

server.listen(8000, () => {
  console.log("Custom Redis Server Running on port 8000");
});
