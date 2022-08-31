let cards = [];
let getCards = 0;
let currentCards = [];
let decks = [];

let activeDeck = 'netrunnerdb';
let activeDeckId = -1;

let selectedCollection = "https://netrunnerdb.com/api/2.0/public/cards";
let selectedFaction = "all";
let selectedCardType = "any";

document.addEventListener('DOMContentLoaded', () => {
    cardFetch();
    deckFetch();

    const collectionFindSelect = document.querySelector('#collection-select');
    const factionFindSelect = document.querySelector('#faction-select');
    const cardTypeFindSelect = document.querySelector('#card-type-select');

    //waits until the getCards fetch is complete
    Promise.all([getCards, getDecks]).then(function () {
    
    //populates deck select
    decks.forEach((e) => {
        const deckOption = document.createElement('option')
        deckOption.classList.add('collection');
        deckOption.value = e.name;
        deckOption.id = `${e.name}`;
        deckOption.textContent = e.name;

        document.getElementById('collection-select').appendChild(deckOption);
    });

    //randomly selects a card and calls makeCardBox on it on page load
    let startCard = cards[randArrayItem(cards)];
    makeCardBox(startCard);
    
    //randomly selects a card and calls makeCardBox on it on button click
    document.getElementById('randomBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        //populate with new random box
        deckFetch();
        let cardArray = cardTypeFilter(factionFilter(cards));
        let newRandCard = cardArray[randArrayItem(cardArray)];
        makeCardBox(newRandCard);
    });

    //searches for cards and calls makeCardBox on them on button click
    document.getElementById('searchBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        
        //populate with new boxes containing searched cards
        deckFetch();
        let cardArray = searchFilter(cardTypeFilter(factionFilter(cards)));
        if(cardArray.length > 100) {
            tooMany();
        } else {
            cardArray.forEach(foundCard => {
                makeCardBox(foundCard);
            })
        }
    })

    //displays all the cards in a collection
    document.getElementById('displayBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));

        //populate with new boxes containing all cards in collection
        deckFetch();
        if(cards.length > 100) {
            tooMany();
        } else {
            cards.forEach(card => {
                makeCardBox(card);
            });
        }
    })

    //deletes the active deck
    document.getElementById('rmvBtn').addEventListener('click', (e) => {
        e.preventDefault();
        
        fetch(`http://localhost:3000/decks/${activeDeckId}`, {
                'method': 'DELETE'
        });

        //removes deck option
        document.getElementById(`${activeDeck[0].name}`).remove();

        //resets values
        activeDeckId = -1;
        activeDeck = 'netrunnerdb';
        cardFetch();
    })

    //creates a new collection
    document.getElementById('addBtn').addEventListener('click', (e) => {
        e.preventDefault();

        let newDeckField = document.createElement('input');
        let newDeckCreateBtn = document.createElement('button');

        newDeckField.id = 'new-deck-name-input';
        newDeckCreateBtn.id = 'new-deck-create-btn';

        newDeckField.placeholder = 'Deck name';
        newDeckCreateBtn.textContent = 'Submit Deck';

        newDeckField.min = "5";
        newDeckField.pattern = "[A-Za-z0-9]{15}";

        document.getElementById('search').appendChild(newDeckField);
        document.getElementById('search').appendChild(newDeckCreateBtn);
        
        //submit new collection
        document.getElementById('new-deck-create-btn').addEventListener('click', (e) => {
            e.preventDefault();

            const deckName = newDeckField.value;
            const deckObj = {};
            deckObj.name = deckName;
            deckObj.cards = [];

            //creates new object in json-server
            fetch("http://localhost:3000/decks", {
                'method': 'POST',
                'headers': {
                "Content-Type": "application/json",
                Accept: "application/json"
                },
                'body': JSON.stringify(deckObj)
            })
            .then((response) => response.json())
            .then(function(data) {
                deckFetch();
            })
            .catch((error) => {
                console.error('Error:', error);
            })

            let newOption = document.createElement('option');
            newOption.value = deckName;
            newOption.textContent = deckName;
            newOption.id = `${deckName}`;
            newOption.classList.add('collection');
            collectionFindSelect.appendChild(newOption);

            document.getElementById('new-deck-name-input').remove();
            document.getElementById('new-deck-create-btn').remove();
        })
    });
    });

    //this is mostly a placeholder until I build the json-server
    collectionFindSelect.addEventListener('change', () => {
        if(collectionFindSelect.value === 'netrunnerdb') {
            cardFetch();
        } else {
            activeDeck = decks.filter(function (el) {
                return el.name === collectionFindSelect.value;
            });
            activeDeckId = activeDeck[0].id;
            cardFetchLocal();
            }
    });

    factionFindSelect.addEventListener('change', () => {
        selectedFaction = factionFindSelect.value;
    });

    cardTypeFindSelect.addEventListener('change', () => {
        selectedCardType = cardTypeFindSelect.value;
    });
})

//fetches the cards from netrunnerdb
function cardFetch() {
    getCards = fetch("https://netrunnerdb.com/api/2.0/public/cards", {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        cards = data.data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//fetches the cards from db.json
function cardFetchLocal() {
    getCardsLocal = fetch(`http://localhost:3000/decks/${activeDeckId}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        cards = data.cards;
  
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//fetches decks
function deckFetch() {
    getDecks = fetch(`http://localhost:3000/decks`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        decks = data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//filters cards based on faction
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

//filters cards based on card type
function cardTypeFilter(dataSet) {
    if(selectedCardType === 'any') {
        return dataSet;
    } else {
        return dataSet.filter(function (el) {
            return el.type_code === `${selectedCardType}`;
        });
    }
};

//filters cards by search
function searchFilter(dataSet) {
    if(document.querySelector('#card_name').value === undefined) {
        return dataSet;
    } else {
        return dataSet.filter(function (el) {
            return el.title.toLowerCase().includes(document.querySelector('#card_name').value.toLowerCase());
        });
    }
};

//behavior if too many cards are called for
function tooMany() {
    let cardArray = cardTypeFilter(factionFilter(cards));
    let newRandCard = cardArray[randArrayItem(cardArray)];
    makeCardBox(newRandCard);
    alert("Too Many Cards to Display");
};

//removes current boxes
function removeElements(elementArray) {
    elementArray.forEach(e => {
        e.remove();
    });
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
    const faction = document.createElement('p');
    const cardImg = document.createElement('img');
    const collectionAddSelect = document.createElement('select');
    const addBtn = document.createElement('button');
    const removeBtn = document.createElement('button');

    //build the cardBox element properties/values/etc.
    cardName.textContent = `${card.title}`;
    faction.textContent = `faction: ${card.faction_code}`;
    cardImg.classList.add('card-image');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${card.code}.jpg`;
    collectionAddSelect.id = 'collection-add';
    for(let i = 1; i < document.querySelectorAll('.collection').length; i++) {
        const newOption = document.createElement('option')
        newOption.value = document.querySelectorAll('.collection')[i].value;
        newOption.textContent = document.querySelectorAll('.collection')[i].textContent;
        collectionAddSelect.appendChild(newOption);
    };
    addBtn.class = 'addBtn';
    addBtn.textContent = 'Add to Deck';
    removeBtn.class = 'removeBtn';
    removeBtn.textContent = 'Remove from Deck';

    //add button function
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();

        //filter to find deck with name matching collectionAddSelect.value and assign deck id to deckId
        let selectedDeck = decks.filter(function (el) {
            return el.name === collectionAddSelect.value;
        });
        let deckId = selectedDeck[0].id;

        //add the current card to the array of cards
        
        currentCards.push(card);
        fetch(`http://localhost:3000/decks/${deckId}`, {
            'method': 'PATCH',
            'headers': {
            "Content-Type": "application/json",
            Accept: "application/json"
            },
            'body': JSON.stringify({
                "cards": currentCards
            })
        })
        .then((response) => response.json())
        .then(function(data) {
        })
        .catch((error) => {
            console.error('Error:', error);
        })

        alert(`${card.title} added to ${collectionAddSelect.options[collectionAddSelect.selectedIndex].textContent}`);
    });

    //remove button function
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();

        //filter to find deck with name matching collectionAddSelect.value and assign deck id to deckId
        let selectedDeck = decks.filter(function (el) {
            return el.name === collectionAddSelect.value;
        });
        let cardIndex = selectedDeck[0].cards.indexOf(card);

        console.log(card);

        console.log(`deck ${selectedDeck}`);

        console.log(`index ${cardIndex}`);
        
        selectedDeck[0].cards.splice([cardIndex], 1);

        console.log(`spliced deck ${selectedDeck[0].cards.splice([cardIndex], 1)}`);


        //remove the current card to the array of cards **not currently working

        //let cardIndex = currentCards.indexOf(card);
/*
        if(cardIndex >= 0) {
            currentCards.splice(cardIndex, 1);
        };

        fetch(`http://localhost:3000/decks/${deckId}`, {
            'method': 'PATCH',
            'headers': {
            "Content-Type": "application/json",
            Accept: "application/json"
            },
            'body': JSON.stringify({
                "cards": currentCards
            })
        })
        .then((response) => response.json())
        .then(function (data) {
        })
        .catch((error) => {
            console.error('Error:', error);
        })
*/
        cards = currentCards;

        document.getElementById(`card${card.code}`).remove();

        alert(`${card.title} removed from ${collectionAddSelect.options[collectionAddSelect.selectedIndex].textContent}`);

    });

    //build the cardBox
    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(faction);
    cardBox.appendChild(collectionAddSelect);
    cardBox.appendChild(addBtn);
    cardBox.appendChild(removeBtn);

    //append the cardBox
    document.getElementById('cardblock').append(cardBox);
};