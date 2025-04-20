
const express  = require("express")

const path = require("path")
const http = require("http")
const socketIO = require("socket.io");

const app = express()
const server = http.createServer(app)
const io = socketIO(server);


const {Server} = require("socket.io")


//const io = new Server(server)
//const io = require("socket.io")(http);

// Serve static files (CSS, JS, IMG folders, etc.)
app.use(express.static(path.join(__dirname, "..")));

// Serve main.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main.html"));
});


let waitingPlayer = null;
let games = [];


/*io.on("connection", (socket) => {
    console.log("User connected");
  
    socket.on("find", (data) => {
      console.log("Find request from:", data.name);
  
      socket.emit("find", {
        allplayers: [
          {
            p1: { p1name: data.name, p1value: "X" },
            p2: { p2name: "Opponent", p2value: "O" },
          },
        ],
      });
    });
  });*/

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("find", ({ name }) => {
        console.log(`Find request from: ${name}`);

        if (waitingPlayer == null) {
            // No waiting player yet, store current player
            waitingPlayer = {
                id: socket.id,
                name: name
            };
        } else {
            // Match found, create game
            const player1 = {
                socketId: waitingPlayer.id,
                p1name: waitingPlayer.name,
                p1value: "X"
            };

            const player2 = {
                socketId: socket.id,
                p2name: name,
                p2value: "O"
            };

            const game = { p1: player1, p2: player2 };
            games.push(game);

            // Notify both players
            io.to(player1.socketId).emit("find", { allplayers: [game] });
            io.to(player2.socketId).emit("find", { allplayers: [game] });

            waitingPlayer = null; // Reset for next match
        }
    });
});

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });


//app.use(express.static(path.resolve("")))

/*
let arr=[]
let playingArray=[]

io.on("connection",(socket)=>{
    socket.on("find",(e) => {
        if(e.name != null){
            arr.push(e.name)

            if(arr.length >= 2){
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: ""
                }
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: ""
                }

                let obj={
                    p1:p1obj,
                    p2:p2obj
                }
                playingArray.push(obj)

                arr.splice(0,2)

                io.emit("find",{allplayer: playingArray})
            }
        }
    })
})
    */
/*
app.get("/",(req,res)=>{
    return res.sendFile("main.html")
})

server.listen(3000,()=>{
    console.log("port connected to 3000")
})
*/


