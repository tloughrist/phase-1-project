//Global variables
let currentDeck = "netrunnerdb";
let remoteDeckServer = "https://netrunnerdb.com/api/2.0/public/cards";
let localDeckServer = "http://localhost:3000/decks";
let selectedFaction = "all";
let selectedCardType = "any";
let deckSelectElement = 0;
let factionSelectElement = 0;
let cardTypeSelectElement = 0;
let currentCards = 0;
let localDecks = 0;
let filteredCards = 0;

//Initial fetch
fetchCards();
fetchDecks();

//**Code to be run after DOM content loads**
document.addEventListener('DOMContentLoaded', () => {
    
    //Assign values to select elements
    deckSelectElement = document.querySelector('#deck-select');
    factionSelectElement = document.querySelector('#faction-select');
    cardTypeSelectElement = document.querySelector('#card-type-select');

    //Displays random card on load
    displayCards(randomCard(currentCards));

    //Search button event listener
    document.getElementById('searchBtn').addEventListener('click', searchButton());

    //Random button event listener
    document.getElementById('randomBtn').addEventListener('click', randomButton());
    
    //Display button event listener
    document.getElementById('displayBtn').addEventListener('click', displayButton());

    //Create button event listener
    document.getElementById('addBtn').addEventListener('click', (e) => {
        e.preventDefault();

        let newDeckField = document.createElement('input');
        newDeckField.id = 'deckInput';
        newDeckField.placeholder = 'Deck name';
        newDeckField.classList.add('disposable');

        let newDeckCreateBtn = document.createElement('button');
        newDeckCreateBtn.id = 'createBtn';
        newDeckCreateBtn.textContent = 'Submit Deck';
        newDeckCreateBtn.classList.add('disposable');

        document.getElementById('search').appendChild(newDeckField);
        document.getElementById('search').appendChild(newDeckCreateBtn);
        
        //submit new deck
        newDeckCreateBtn.addEventListener('click', (e) => {
            e.preventDefault();

            //Build empty deck
            const emptyDeck = {
                'name': newDeckField.value,
                'value': newDeckField.value,
                'cards': []
            };
 
            //creates new object in json-server
            fetch(`${localDeckServer}`, {
                'method': 'POST',
                'headers': {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                'body': JSON.stringify(emptyDeck)
            })
            .then((response) => response.json())
            .then(function(data) {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

            //Updates localDecks and selectDeck options and selectDeck options on cards(??)
            update(localDecks);
            addOption(emptyDeck, deckSelectElement);
            //addOption(emptyDeck, ??eachCardSelect??)

            //Remove the new form elements
            removeElements(document.querySelectorAll('.disposable'));
        });
    });

    //Event listeners for changes in the form select elements
    deckSelectElement.addEventListener('change', () => {
        currentDeck = deckSelectElement.value;
        update(currentCard);
    });

    factionSelectElement.addEventListener('change', () => {
        selectedFaction = factionSelectElement.value;
    });

    cardTypeSelectElement.addEventListener('change', () => {
        cardTypeSelectElement = cardTypeFindSelect.value;
    });
});

//**Code running outside DOMContentLoaded event**

//fetches the cards from the current deck
function fetchCards(server) {
    if(currentDeck === "netrunnerdb") {
        currentCards = fetchCardsRemote();
    } else {
        currentCards = fetchCardsLocal();
    }
};

function fetchCardsRemote() {
    fetch(`${remoteDeckServer}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        console.log(`fetch cards remote: ${data.data}`);
        return data.data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

function fetchCardsLocal() {
    fetch(`${localDeckServer}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        //console.log(`fetch cards local: ${data.cards}`);
        return data.cards;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

function fetchDecks() {
    fetch(`${localDeckServer}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        console.log(`fetch decks: ${data}`)
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//Applies form filters to a given array
function filter(arrayObjs) {
    return searchFilter(cardTypeFilter(factionFilter(arrayObjs)));
}
  
//filters cards based on faction
function factionFilter(arrayObjs) {
    if(selectedFaction === 'all') {
        return arrayObjs;
    } else if (selectedFaction === 'corp' || selectedFaction === 'runner') {
        return arrayObjs.filter(function (el) {
            return el.side_code === `${selectedFaction}`;
        });
    } else {
        return arrayObjs.filter(function (el) {
            return el.faction_code === `${selectedFaction}`
        });
    }
};

//filters cards based on card type
function cardTypeFilter(arrayObjs) {
    if(selectedCardType === 'any') {
        return arrayObjs;
    } else {
        return arrayObjs.filter(function (el) {
            return el.type_code === `${selectedCardType}`;
        });
    }
};

//filters cards by search
function searchFilter(arrayObjs) {
    if(document.querySelector('#card_name').value === undefined) {
        return arrayObjs;
    } else {
        return arrayObjs.filter(function (el) {
            return el.title.toLowerCase().includes(document.querySelector('#card_name').value.toLowerCase());
        });
    }
};

//Function for random button
function randomButton() {
    e.preventDefault();
    removeElements(document.querySelectorAll('.card-box'));
    //populate with new random box
    displayCards(randomCard(filteredCards));
};

function randomCard(cards) {
    return cards[randArrayItem(cards)];
};

function randArrayItem(array) {
    let randIndex = Math.floor(Math.random() * (array.length - 1));
    return randIndex;
};

function searchButton() {
    e.preventDefault();
    removeElements(document.querySelectorAll('.card-box'));
    //populate with new boxes containing searched cards
    if(currentCards.length > 100) {
        tooManyAlert();
    } else {
    displayCards(filteredCards);
    }
};

function displayButton () {
    e.preventDefault();
    removeElements(document.querySelectorAll('.card-box'));
    //populate with new boxes containing all cards in deck
    if(currentCards.length > 100) {
        tooManyAlert();
    } else {
        displayCards(currentCards);
    }
};

//behavior if too many cards are called for
function tooManyAlert() {
    randomButton();
    alert("Too Many Cards to Display");
};

//removes current boxes
function removeElements(elementArray) {
    elementArray.forEach(e => {
        e.remove();
    });
};

function displayCards(cards) {
    cards.forEach((e) => {
        createCardBox(e);
    });
};

function createCardBox(card) {
    //build the cardBox itself
    const cardBox = document.createElement('div');
    cardBox.classList.add('card-box');

    //build the cardBox elements
    const cardName = document.createElement('h3');
    cardName.textContent = `${card.title}`;

    const faction = document.createElement('p');
    faction.textContent = `faction: ${card.faction_code}`;

    const cardImg = document.createElement('img');
    cardImg.classList.add('card-image');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${card.code}.jpg`;

    const cardDeckSelect = document.createElement('select');
    cardDeckSelect.id = 'collection-add';

    const addBtn = document.createElement('button');
    addBtn.classList.add('addBtn');
    addBtn.textContent = 'Add to Collection';
    addButton(addBtn, card);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('removeBtn');
    removeBtn.textContent = 'Remove from Collection';
    removeButton(removeBtn, card);
    
    //append the elements
    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(faction);
    cardBox.appendChild(collectionAddSelect);
    cardBox.appendChild(addBtn);
    cardBox.appendChild(removeBtn);
    
    //append the cardBox
    document.getElementById('cardblock').append(cardBox);
};

function addButton(button, card) {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`${card.title} added to ...`);
        });
};

function removeButton(button, card) {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`${card.title} removed from ...`);
        });
};




/*





    collectionAddSelect.id = 'collection-add';
    for(let i = 1; i < document.querySelectorAll('.collection').length; i++) {
        const newOption = document.createElement('option')
        newOption.value = document.querySelectorAll('.collection')[i].value;
        newOption.textContent = document.querySelectorAll('.collection')[i].textContent;
        collectionAddSelect.appendChild(newOption);
    };


    //add button function
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let deckId = 1;
        
        //filter to find deck with name matching collectionAddSelect.value and assign deck id to deckId
        let selectedDeck = decks.filter(function (el) {
            return el.name === collectionAddSelect.value;
        });
        deckId = selectedDeck.id;
 
        //add the current card to the array of cards
        currentCards = decks[deckId].cards.push(card);

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
            console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })

    });
*/
