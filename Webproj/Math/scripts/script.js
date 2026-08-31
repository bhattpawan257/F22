hcfin= document.getElementById("hcfIn");
hcfdisp= document.getElementById("hcfDisp");
let hcfArr=[];
function NXTbtn(oper){
  
  switch (oper){
    case "hcf": 
      hcfItem=hcfin.value;
      hcfin.value=0
      hcfArr.push(hcfItem);
      hcfdisp.textContent+=hcfItem;
      console.log(hcfArr)
      break;
  };
};

function DONEbtn(oper){
  switch (oper){
    case "hcf": 
      hcf= calcHCF(hcfArr);
      hcfArr=[];
      hcfdisp.textContent=hcf;
      break;

  };
};
  