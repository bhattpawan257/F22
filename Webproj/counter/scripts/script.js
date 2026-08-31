                                                                                                                                                                                                   
let countP= document.getElementById("countP");
let counter=Number(countP.textContent);
document.getElementById("reduceB").onclick = function(){
    counter--;
    countP.textContent=counter;
}
document.getElementById("increaseB").onclick = function(){
    counter++;
    countP.textContent=counter;
}
document.getElementById("resetB").onclick = function(){
    counter=0;
    countP.textContent=counter;
}