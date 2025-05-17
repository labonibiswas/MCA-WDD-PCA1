const socket = io();
let playerName = "";
let playerSymbol = "";
let isMyTurn = false;

const boxes = document.querySelectorAll(".box")
const resetBtn = document.querySelector("#reset-btn")
const newBtn = document.querySelector("#new-btn")
const msgContainer = document.querySelector(".msg-container")
const msg = document.querySelector("#msg")

document.getElementById("loading").style.display = "none"
document.getElementById("bigCont").style.display = "none"
document.getElementById("userCont").style.display = "none"
document.getElementById("oppNameCont").style.display = "none"
document.getElementById("valueCont").style.display = "none"
document.getElementById("whosTurn").style.display = "none"
document.getElementById("reset-btn").style.display = "none"


document.getElementById("find").addEventListener("click", () => {
    playerName = document.getElementById("name").value.trim();

    if(!playerName){
        alert("enter a name")
        return
    }

    document.getElementById("user").innerText = playerName
    socket.emit("find", {name: playerName})
    document.getElementById("find").disabled = true;
    document.getElementById("loading").style.display = "block";
})

socket.on("find",(e)=>{
    
    const match = e.allplayers.find((obj) =>
        obj.p1.p1name === playerName || 
        obj.p2.p2name === playerName
    )

    if(!match || !match.p1.p1name || !match.p2.p2name) return

    const isP1 = match.p1.p1name === playerName
    const opponent = isP1 ? match.p2.p2name : match.p1.p1name
    playerSymbol = isP1 ? match.p1.p1value : match.p2.p2value

    document.getElementById("oppName").innerText = opponent;
    document.getElementById("value").innerText = playerSymbol;
    document.getElementById("userCont").style.display = "block";
    document.getElementById("oppNameCont").style.display = "block";
    document.getElementById("valueCont").style.display = "block";
    document.getElementById("loading").style.display = "none";
    document.getElementById("name").style.display = "none";
    document.getElementById("find").style.display = "none";
    document.getElementById("enterName").style.display = "none";
    document.getElementById("bigCont").style.display = "block";
    document.getElementById("whosTurn").style.display = "block";
    document.getElementById("whosTurn").innerText = "X's Turn";
   
})


socket.on("game-start", ({symbol, turn, yourTurn }) => {
    playerSymbol = symbol
    isMyTurn = yourTurn
    const turnElement = document.getElementById("whosTurn");
    if (turnElement) {
        turnElement.innerText = `${turn}'s Turn`;
    } else {
        console.error("Element with id 'whosTurn' not found.");
    }

})

boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if(!isMyTurn || box.innerText !== "") return
        box.innerText = playerSymbol
        box.disabled = true
        box.style.color = playerSymbol === "X" ? "#A03C78" : "#76BA99"

        socket.emit("make-move", { index, symbol: playerSymbol });
        isMyTurn = false;
        document.getElementById("whosTurn").innerText = `${playerSymbol === "X" ? "O" : "X"}'s Turn`;

        checkWinner();
    })
})


socket.on("opponent-move", ({index, symbol}) => {
    boxes[index].innerText = symbol
    boxes[index].disabled = true
    boxes[index].style.color = symbol === "X" ? "#A03C78" : "#76BA99"

    
    isMyTurn = true
    document.getElementById("whosTurn").innerText = `${playerSymbol}'s Turn`

    checkWinner()

})

socket.on("opponent-left", () => {
    alert("opponent left the game.")
    resetGame()
})

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];


function checkWinner() {
    for(const pattern of winPatterns) {
        const [a, b, c] = pattern
        const val1 = boxes[a].innerText;
        const val2 = boxes[b].innerText;
        const val3 = boxes[c].innerText;

        if(val1 && val1 === val2 && val2 === val3){
            showWinner(val1)
            return true
        }
    }

    if([...boxes].every(box => box.innerText)){
        gameDraw()
    }
    return false
}

function showWinner(winner){
    msg.innerText = `🎉 Winner is ${winner}!`
    msgContainer.classList.remove("hide")
    disabledBoxes()

    document.getElementById("whosTurn").style.display = "none"
}


function gameDraw() {
    msg.innerText = `It's a Draw! 🤝`
    msgContainer.classList.remove("hide")
    disabledBoxes()
    document.getElementById("whosTurn").style.display = "none"  // Hide turn display
}



function disabledBoxes(){
    boxes.forEach(box => box.disabled = true)
}

function enabledBoxes(){
    boxes.forEach(box => {
        box.disabled = false
        box.innerText = ""
    })
}

function resetGame(){
    enabledBoxes();
    msgContainer.classList.add("hide")
    isMyTurn = playerSymbol === "X"
    document.getElementById("whosTurn").style.display = "block"
    document.getElementById("whosTurn").innerText = "X's Turn"
}

newBtn.addEventListener("click", resetGame)

resetBtn.addEventListener("click", resetGame)