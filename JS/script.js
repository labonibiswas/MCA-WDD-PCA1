document.getElementById("loading").style.display = "none"
document.getElementById("bigCont").style.display = "none"
document.getElementById("userCont").style.display = "none"
document.getElementById("oppNameCont").style.display = "none"
document.getElementById("valueCont").style.display = "none"
document.getElementById("whosTurn").style.display = "none"
document.getElementById("reset-btn").style.display = "none"

const socket = io();
let name;

document.getElementById("find").addEventListener("click",function(){

    console.log("Find button clicked");

    name = document.getElementById("name").value;

    document.getElementById("user").innerText = name

    if(name == null || name == ''){
        alert("enter a name")
    }else{
        socket.emit("find",{name:name})

        document.getElementById("loading").style.display = "block";
        document.getElementById("find").disabled = true;
    }

})

socket.on("find",(e)=>{
    const allplayersArray = e.allplayers

    // Find the game this player is in
    const foundObj = allplayersArray.find(obj => obj.p1.p1name === `${name}` || obj.p2.p2name === `${name}`)
    
    // Wait until both players are present in the match
    if (!foundObj || !foundObj.p1.p1name || !foundObj.p2.p2name) {
        console.log("Waiting for an opponent...");
        return; // Still waiting
    }
    
    console.log("Opponent found:", foundObj);

    console.log(allplayersArray)

    document.getElementById("userCont").style.display = "block"
    document.getElementById("oppNameCont").style.display = "block"
    document.getElementById("valueCont").style.display = "block"
    document.getElementById("loading").style.display = "none"
    document.getElementById("name").style.display = "none"
    document.getElementById("find").style.display = "none"
    document.getElementById("enterName").style.display = "none"
    document.getElementById("bigCont").style.display = "block"
    document.getElementById("whosTurn").style.display = "block"
    document.getElementById("whosTurn").innerText = "X's Turn"

    document.getElementById("reset-btn").style.display = "none"

    let oppName

    let value


    if (foundObj.p1.p1name === name) {
        oppName = foundObj.p2.p2name;
        value = foundObj.p2.p2value;
    } else {
        oppName = foundObj.p1.p1name;
        value = foundObj.p1.p1value;
    }
    

    /*foundObj.p1.p1name == `${name}` ? oppName = foundObj.p2.p2name : oppName = foundObj.p1.p1name

    foundObj.p1.p1name == `${name}` ? value = foundObj.p2.p2value : value = foundObj.p1.p1value*/

    document.getElementById("oppName").innerText = oppName
    document.getElementById("value").innerText = value

})

































let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");




let turnO = true;
let count = 0;


const winPatterns = [
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,5,8],
    [2,4,6],
    [3,4,5],
    [6,7,8],
];

const resetGame = () => {
    turnO = true;
    count = 0;
    enabledBoxes();
    msgContainer.classList.add("hide");
}

boxes.forEach((box) =>{
    box.addEventListener("click",() => {
        
        if(turnO){
            box.innerText = "O";
            box.style.color = "#76BA99";
            turnO = false;
        }else{
            box.innerText = "X"
            box.style.color = "#A03C78";
            turnO = true;
        }
        box.disabled = true;
        count++;
        let isWinner = checkWinner();
        
        if(count === 9 && !isWinner){
            gameDraw();
        }
    });
});

const gameDraw = () => {
    msg.innerText = `Game was a Draw.`;
    msgContainer.classList.remove("hide");
    disabledBoxes();
}

const disabledBoxes = () => {
    for (let box of boxes){
        box.disabled = true;
    }
};

const enabledBoxes = () => {
    for (let box of boxes){
        box.disabled = false;
        box.innerText = "";
    }
}

const showWinner = (winner) => {
    msg.innerText = `congratulations!!, winner is ${winner}`;
    msgContainer.classList.remove("hide");
    disabledBoxes();
};


const checkWinner = () => {
    for(pattern of winPatterns){
       let pos1Val = boxes[pattern[0]].innerText;
       let pos2Val = boxes[pattern[1]].innerText;
       let pos3Val = boxes[pattern[2]].innerText;

       if (pos1Val != "" && pos2Val != "" && pos3Val != ""){
        if(pos1Val === pos2Val && pos2Val === pos3Val){
            showWinner(pos1Val);
            return true;
        }
       }
    }

};


newBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

