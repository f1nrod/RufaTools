//main code START
document.querySelector('#format').addEventListener('click', () => {

    const farmers = new Map([
        ["Wolftoes", 0],
        ["scout", 0],
        ["MyShadow", 0],
        ["wolfe", 0],
        ["Jamie123", 0],
        ["Drongo", 0],
        ["JimmyVe", 0],
        ["gara", 0],
        ["tamandua", 0],
        ["spook", 0],
        ["AntLover", 0],
        ["viperuk", 0]
    ]);

    const farmers_regex = new RegExp('(' + Array.from(farmers.keys()).join('|') + ')', 'i');
    // (Wolftoes|scout|myshadow|wolfe|jamie123|Drongo|JimmyVe|gara|tamandua|spook|antlover|viperuk)

    document.querySelector('#input').value.split(/\n[\d\s]+\n/).map(line => {
        // splits the line after the "remaining mats to send", for example: 
        //wolfe
        //Mar 23 at 9:30 pm
        //Delete Modify+1490
        //3 910                 <-- splits here


        console.log("\nLINE:\n" + line + "\n"); //for debugging

        const farmer = line.match(farmers_regex); //check which farmer sent this message 
        if (farmer) { 
            if (line.includes("+")) { //locate the + sign and take the numbers after that in a string
                matstr = line.split("+")[1].split("\n")[0].match(/\d/g);
                materials = parseInt(matstr.join("")); //from string to number
                console.log(farmer[0] + ": " + materials);
                farmers.set(farmer[0], farmers.get(farmer[0]) + materials); // mdd to total for this farmer
            }
        }
    });

    let totalSent = Array.from(farmers.values()).reduce((acc, val) => acc + val, 0);

    //output parse
    document.querySelector('#output').value = '[b]Convoy STATS:[/b]';
    farmers.forEach(function (val, key) {
        if (val > 0) document.querySelector('#output').value += '\n[b]' + key + ':[/b]  +' + val;
    });
    document.querySelector('#output').value += '\n' + '[b]' + 'TOTAL SENT:[/b]  +' + totalSent;

}); //main code END

// for clearing the input
document.querySelector('#clear').addEventListener('click', () => {
    document.querySelector('#input').value = "";
})

// for clearing the output
document.querySelector('#clear2').addEventListener('click', () => {
    document.querySelector('#output').value = "";
})