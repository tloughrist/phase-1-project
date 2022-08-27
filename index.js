let cards = [];

//fetches the cards from netrunnerdb
const getCards = fetch("https://netrunnerdb.com/api/2.0/public/cards", {
    headers: {
        Accept: "application/json"
    }
    })
.then((response) => response.json())
.then(function(data) {
    cards = data.data;
    //console.log(cards);
})
.catch((error) => {
    console.error('Error:', error);
})

//returns a random index number for a given array
function randArrayItem(array) {
    let randIndex = Math.floor(Math.random() * (array.length - 1));
    return randIndex;
};

//appends a card's image to the cardblock element
function printImg(cardCode) {
    const cardImg = document.createElement('img');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${cardCode}.jpg`
    cardImg.id = 'randomCard'
    document.getElementById('cardblock').append(cardImg);
};

//waits until the getCards fetch is complete
Promise.all([getCards]).then(function () {
    //randomly selects a card and calls printImg on it
    printImg(cards[randArrayItem(cards)].code);
    document.getElementById('randomBtn').addEventListener('click', () => {
        document.getElementById('randomCard').remove();
        printImg(cards[randArrayItem(cards)].code);
    })
});

/*

*/