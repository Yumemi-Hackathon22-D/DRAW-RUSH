function getOdaiFile() {
    fetch("/Odai.txt", {
        method: "GET",
    }).then(response => response.text())
        .then(text => {
            const arr = text.split(/\r\n|\n/).map(x=>x.split(","));
            console.log(arr);
            odais=arr;
        });
}
getOdaiFile();
let odais;

export function getRandomOdai() {

}