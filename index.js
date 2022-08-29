let cards = [];
let getCards = 0;

let selectedCollection = "https://netrunnerdb.com/api/2.0/public/cards";
let selectedFaction = "all";
let selectedCardType = "any";

document.addEventListener('DOMContentLoaded', () => {
    cardFetch();

    //waits until the getCards fetch is complete
    Promise.all([getCards]).then(function () {
    
    //randomly selects a card and calls makeCardBox on it on page load
    let startCard = cards[randArrayItem(cards)];
    makeCardBox(startCard);
    document.getElementById(`card${startCard.code}`).id = "randomCard";
    
    //randomly selects a card and calls makeCardBox on it on button click
    document.getElementById('randomBtn').addEventListener('click', () => {
        //remove old boxes
        const cardBoxes = document.querySelectorAll('.card-box');
        cardBoxes.forEach(box => {
            box.remove();
        });
        //populate with new random box
        let cardArray = cardTypeFilter(factionFilter(cards));
        let newRandCard = cardArray[randArrayItem(cardArray)];
        makeCardBox(newRandCard);
        document.getElementById(`card${newRandCard.code}`).id = "randomCard";
    })
    });

    const collectionFindSelect = document.querySelector('#collection-select');
    const factionFindSelect = document.querySelector('#faction-select');
    const cardTypeFindSelect = document.querySelector('#card-type-select');

    //this is mostly a placeholder until I build the json-server
    collectionFindSelect.addEventListener('change', () => {
        if(collectionFindSelect.value === 'netrunnerdb') {
            selectedCollection = "https://netrunnerdb.com/api/2.0/public/cards";
            cardFetch();
        } else {
            console.log(collectionFindSelect.value);
        }
    });

    factionFindSelect.addEventListener('change', () => {
        selectedFaction = factionFindSelect.value;
        console.log(selectedFaction);
    });

    cardTypeFindSelect.addEventListener('change', () => {
        selectedCardType = cardTypeFindSelect.value;
    });
})

//fetches the cards from netrunnerdb
function cardFetch() {
    getCards = fetch(`${selectedCollection}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        cards = data.data;
        console.log(cards);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//filters cards from API base on faction
function factionFilter(dataSet) {
    if(selectedFaction === 'all') {
        return dataSet;
    } else if (selectedFaction === 'corp' || selectedFaction === 'runner') {
        return dataSet.filter(function (el) {
            return el.side_code === `${selectedFaction}`;
        });
    } else {
        return dataSet.filter(function (el) {
            return el.faction_code === `${selectedFaction}`
        });
    }
};

//filters cards from API base on card type
function cardTypeFilter(dataSet) {
    if(selectedCardType === 'any') {
        return dataSet;
    } else {
        return dataSet.filter(function (el) {
            return el.type_code === `${selectedCardType}`;
        });
    }
};

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

//create the card displays
function makeCardBox(card) {

    //create the cardBox element and pick out the current card
    const cardBox = document.createElement('div');
    cardBox.classList.add('card-box');
    cardBox.id = `card${card.code}`;
    
    //build the cardBox elements
    const cardName = document.createElement('h3');
    const side = document.createElement('p');
    const faction = document.createElement('p');
    const cardImg = document.createElement('img');
    const collectionAddSelect = document.createElement('select');
    const addBtn = document.createElement('button');

    //build the cardBox element properties/values/etc.
    cardName.textContent = `${card.title}`;
    side.textContent = `side: ${card.side_code}`;
    faction.textContent = `faction: ${card.faction_code}`;
    cardImg.classList.add('card-image');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${card.code}.jpg`;
    collectionAddSelect.id = 'collection-add';
    addBtn.id = 'addBtn';
    addBtn.textContent = 'Add to Collection';
  
    //build the cardBox
    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(side);
    cardBox.appendChild(faction);
    cardBox.appendChild(collectionAddSelect);
    cardBox.appendChild(addBtn);

    //append the cardBox
    document.getElementById('cardblock').append(cardBox);
};


/*
*/