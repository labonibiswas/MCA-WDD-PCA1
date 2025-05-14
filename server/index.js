const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const path = require("path");
app.use(express.static(path.join(__dirname, "..")));

const PORT = 3000;

app.use(express.static("public"));

let waitingPlayer = null;
let games = {};

io.on("connection", (socket) => {
    console.log(`New Client connected: ${socket.id}`);

    socket.on("find", ({ name }) => {
        socket.playerName = name;

        if (waitingPlayer === null) {
            // No one waiting, this player waits
            waitingPlayer = socket;
            console.log(`${name} is waiting for a player...`);
        } else {
            // Match found
            const playerX = waitingPlayer;
            const playerO = socket;
            const gameId = `${playerX.id}#${playerO.id}`;

            games[gameId] = {
                p1: playerX,
                p2: playerO,
                turn: "X"
            };

            playerX.gameId = gameId;
            playerO.gameId = gameId;

            console.log(`Game started between ${playerX.playerName} and ${playerO.playerName}`);

            const playerObj = {
                allplayers: [
                    {
                        p1: { p1name: playerX.playerName, p1value: "X" },
                        p2: { p2name: playerO.playerName, p2value: "O" }
                    }
                ]
            };

            playerX.emit("find", playerObj);
            playerO.emit("find", playerObj);

           playerX.emit("game-start", {
                symbol: "X",
                turn: "X",      
                yourTurn: true
            });

            playerO.emit("game-start", {
                symbol: "O",
                turn: "X",
                yourTurn: false
            });

            waitingPlayer = null;
        }
    });

    socket.on("make-move", ({ index, symbol }) => {
        const gameId = socket.gameId;
        const game = games[gameId];
        if (!game) return;

        const opponent = (game.p1 === socket) ? game.p2 : game.p1;
        opponent.emit("opponent-move", { index, symbol });

        game.turn = (symbol === "X") ? "O" : "X";
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }

        const gameId = socket.gameId;
        if (gameId && games[gameId]) {
            const opponent = (games[gameId].p1 === socket)
                ? games[gameId].p2
                : games[gameId].p1;

            if (opponent) {
                opponent.emit("opponent-left");
            }

            delete games[gameId];
        }
    });
});


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
