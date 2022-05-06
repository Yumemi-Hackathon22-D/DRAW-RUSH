function getOdaiFile() {
    fetch("/Odai.txt", {
        method: "GET",
    }).then(response => response.text())
        .then(text => {
            const arr = text.split(/\r\n|\n/).filter(v=>!v.startsWith('//')&&v!=="");
            console.log(arr);
            odais=arr;
        });
}
getOdaiFile();
let odais;

export function getRandomOdai() {
   return  odais[Math.floor(Math.random()*odais.length)]
}