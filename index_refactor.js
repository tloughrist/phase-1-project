//Global variables
let currentDeck = "netrunnerdb";
let remoteDeckServer = "https://netrunnerdb.com/api/2.0/public/cards";
let localDeckServer = "http://localhost:3000/decks";
let selectedFaction = "all";
let selectedCardType = "any";
let deckSelectElement = 0;
let factionSelectElement = 0;
let cardTypeSelectElement = 0;
const currentCards = [];
let localDecks = [0];
let filteredCards = [0];
let currentDeckId = 0;


netrunnerdbDeckSelect();

//fetches data from netrunnerdb, pushes the cards into currentCards, displays a random card from currentCards
function netrunnerdbDeckSelect() {
    return fetchData('remote')
    .then((response) => response.json())
    .then((data) => currentCards.push(...data.data))
    .then(() => console.log(currentCards))
    .then(() => displayCards(randomCard(currentCards)))
    .catch((error) => console.error('Fetch netrunnerdb Error:', error));
}
fetchData('decks');

function fetchCardsRemote() {
    return fetch(`${remoteDeckServer}`, {
        headers: {
            Accept: "application/json"
        }
    }) 
};

function fetchData(dataSource) {
    if(dataSource === 'remote') {
        return fetchCardsRemote();
    } else if(dataSource === 'local') {
        return fetchCardsLocal();
    } else {
        return fetchDecks();
    }
};

//**Code to be run after DOM content loads**
document.addEventListener('DOMContentLoaded', () => {
    
    //Assign values to select elements
    deckSelectElement = document.querySelector('#collection-select');
    factionSelectElement = document.querySelector('#faction-select');
    cardTypeSelectElement = document.querySelector('#card-type-select');

    //Search button event listener
    document.getElementById('searchBtn').addEventListener('click', (e) => {
        e.preventDefault();
        searchButton()
    });

    //Random button event listener
    document.getElementById('randomBtn').addEventListener('click', (e) => {
        e.preventDefault();
        randomButton();
    });
    
    //Display button event listener
    document.getElementById('displayBtn').addEventListener('click', (e) => {
        e.preventDefault();
        displayButton();
    });

    //delete button event listener
    document.getElementById('rmvBtn').addEventListener('click', (e) => {
        deleteButton();
    });

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

        document.getElementById('create-form').appendChild(newDeckField);
        document.getElementById('create-form').appendChild(newDeckCreateBtn);
        
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
                fetchDecks();
            })
            .catch((error) => {
                console.error('Error:', error);
            });

            //Remove the new form elements
            removeElements(document.querySelectorAll('.disposable'));
        });
    });

    //event listeners for changes in the form select elements
    deckSelectElement.addEventListener('change', () => {
        currentDeck = deckSelectElement.value;
        updateDeckId(currentDeck);
        fetchCards();
        if(currentDeck === 'netrunnerdb') {
            fetchDecks();
        }
    });

    factionSelectElement.addEventListener('change', () => {
        selectedFaction = factionSelectElement.value;
    });

    cardTypeSelectElement.addEventListener('change', () => {
        selectedCardType = cardTypeSelectElement.value;
    });
});

//**Code running outside DOMContentLoaded event**

//sets values based for search filters
function setSelectValues(valueToChange, input) {
    valueToChange = input;
};

//fetches the cards from the current deck
function fetchCards() {
    if(currentDeck === "netrunnerdb") {
        fetchData('remote')
        .then((response) => response.json())
        .then(() => currentCards.splice(0,currentCards.length))
        .then((data) => currentCards.push(...data.data))
        .then(() => displayCards(randomCard(currentCards)))
    } else {
        fetchCardsLocal();
    }
};

/*function fetchCardsRemote() {
    //return the fetch request and chain on .then to encapsulate the dependent functions
    fetch(`${remoteDeckServer}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        //sets the current cards to the cards from netrunnerdb
        currentCards = data.data;
        return data.data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};*/

function fetchCardsLocal() {
    fetch(`${localDeckServer}/${currentDeckId}`, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        //sets the current cards to the cards from netrunnerdb
        currentCards.splice(0,currentCards.length)
        currentCards.push(...data.cards);
        //remove old card boxes
        removeElements(document.querySelectorAll('.card-box'));
        //Displays random card
        displayCards(currentCards);
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
        //sets the local decks to the decks from db.json
        localDecks = data;
        //removes existing deck options
        const deckArray = Array.prototype.slice.call(document.getElementsByClassName('new-deck'));
        removeElements(deckArray);
        //sets new deck options
        setDeckOptions(deckSelectElement);
        //remove old card boxes
        //emoveElements(document.querySelectorAll('.card-box'));
        //Displays random card
        //displayCards(randomCard(currentCards));
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    })
};

//applies form filters to a given array
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

//function for random button
function randomButton() {
    //remove old card boxes
    removeElements(document.querySelectorAll('.card-box'));
    //update filtered cards
    filteredCards = filter(currentCards);
    //populate with new random box
    displayCards(randomCard(filteredCards));
};

function randomCard(cards) {
    let randCard = [];
    randCard.push(cards[randArrayItem(cards)]);
    return randCard;
};

function randArrayItem(array) {
    if(array === undefined) {
        console.log(-1)
        return -1;
    } else {
        console.log(array)
        let randIndex = Math.floor(Math.random() * (array.length));
        console.log(randIndex)
        return randIndex;
    }
};

function searchButton() {
    //remove old card boxes
    removeElements(document.querySelectorAll('.card-box'));
    //update filtered cards
    filteredCards = filter(currentCards);
    //populate with new boxes containing searched cards
    console.log(filteredCards.length)
    if(filteredCards.length > 100) {
        tooManyAlert();
    } else {
    displayCards(filteredCards);
    }

    //resets form elements and misc. values
    document.getElementById('search').reset();
    selectedFaction = factionSelectElement.value;
    selectedCardType = cardTypeSelectElement.value;
};

function displayButton() {
    //remove old card boxes
    removeElements(document.querySelectorAll('.card-box'));
    //populate with new boxes containing all cards in deck
    if(currentCards.length > 100) {
        tooManyAlert();
    } else {
        displayCards(currentCards);
    }
};

function deleteButton() {
    fetch(`http://localhost:3000/decks/${currentDeckId}`, {
        'method': 'DELETE'
    })
};

//behavior if too many cards are called for
function tooManyAlert() {
    randomButton();
    alert("Too Many Cards to Display");
};

//removes current boxes
function removeElements(elementArray) {
    elementArray.forEach((e) => {
        e.remove();
    });
};

//display handler
function displayCards(cards) {
    cards.forEach((e) => {
        createCardBox(e);
    });
};

//creates and appends card boxes
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
    setDeckOptions(cardDeckSelect);

    const addBtn = document.createElement('button');
    addBtn.classList.add('addBtn');
    addBtn.textContent = 'Add to Collection';
    addButton(addBtn, card, cardDeckSelect);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('removeBtn');
    removeBtn.textContent = 'Remove from Collection';
    removeButton(removeBtn, card);
    
    //append the elements
    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(faction);
    cardBox.appendChild(cardDeckSelect);
    cardBox.appendChild(addBtn);
    cardBox.appendChild(removeBtn);
    
    //append the cardBox
    document.getElementById('cardblock').append(cardBox);
};

function addButton(button, card, selectElement) {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        let modifyDeckId = -1;
        //filter to find deck with name matching collectionAddSelect.value and assign deck id to modifyDeckId
        let modifyDeck = localDecks.filter(function (el) {
            return el.name === selectElement.value;
        });
        modifyDeckId = modifyDeck[0].id;
        modifyDeckIndex = localDecks.indexOf(modifyDeck[0]);

        //add the current card to the array of cards
        let modifyDeckCards = localDecks[modifyDeckIndex].cards;
        modifyDeckCards.push(card);
        console.log(modifyDeckCards)

        fetch(`http://localhost:3000/decks/${modifyDeckId}`, {
            'method': 'PATCH',
            'headers': {
            "Content-Type": "application/json",
            Accept: "application/json"
            },
            'body': JSON.stringify({
                "cards": modifyDeckCards
            })
        })
        .then((response) => response.json())
        .then(function(data) {
            //console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        alert(`${card.title} added to ${selectElement.value}`);
        });
};

function removeButton(button, card) {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        /*

        */


        alert(`${card.title} removed from ${selectElement.value}`);
        });
};

//add options to a select element
function addOption(optionName, selectElement) {
    const newOption = document.createElement('option');
    newOption.id = optionName;
    newOption.value = optionName;
    newOption.textContent = optionName;
    newOption.classList.add('new-deck');
    selectElement.appendChild(newOption);
};

//updates currentDeckId to the id...of the current deck
function updateDeckId(deckName) {
    if(deckName === 'netrunnerdb') {
        currentDeckId = -1;
    } else {
        const deckObj = localDecks.filter(function (el) {
            return el.name === deckName;
        });
        currentDeckId = deckObj[0].id;
    };
};

function setDeckOptions(selectElement) {
    localDecks.forEach((e) => {
        addOption(e.name, selectElement);
    });
};