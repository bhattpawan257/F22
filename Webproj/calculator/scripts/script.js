let display= document.getElementById("display");
let oper= false;
let eqn= "";
let answer;
let sub = document.getElementById("subp")
console.log(display);
function appendToDisplay(value){
    if ("+-×÷^".includes(value) && oper){alert("no continuous operator");}
    else{
        if ("+-×÷^".includes(value)){oper= true;} 
        else {oper= false;}
        switch (value){
            case ("×"): display.value += "×"; eqn+="*"; break;
            case ("÷"): display.value += "÷"; eqn+="/"; break;
            case ("+"): display.value += "+"; eqn+="+"; break;
            case ("-"): display.value += "-"; eqn+="-"; break;
            case ("^"): display.value += "^("; eqn+="**("; break;
            default: display.value += value; eqn+=value;
        }
    }
}

function evaluateAns(){
    try {
        answer=eval(eqn);
    }
    catch(error){
        answer="Err";
    };
    console.log(answer,eqn);
    sub.textContent=display.value;
    display.value=answer;
    eqn=display.value;
}
function clearDisplay(){
    display.value="";
    subp.textContent="";
    eqn=""
}