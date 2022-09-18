/**************************************************************************
***************************INITIAL FETCHING AND POPULATION*****************
**************************************************************************/

const localDecks = [];
const remoteCards = [];

const initialFetchDecks = fetchData('decks')
.then((result) => localDecks.push(...result))
.then(() => localDecks.forEach((deck) => addOption(deck, document.getElementById('active-deck'))));

const initialFetchCards = fetchData('remote')
.then((result) => remoteCards.push(...result));

Promise.all([initialFetchCards, initialFetchDecks])
.then(() => displayCards(randomCards(remoteCards, 52)));

/**************************************************************************
****************ASSIGN INITIAL HTML ELEMENT EVENTLISTENERS*****************
**************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        return searchButton();  
    });
    document.getElementById('randomBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        return randomButton();
    });
    document.getElementById('displayBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        return displayButton();
    });
    document.getElementById('removeBtn').addEventListener('click', (e) => {
        return deleteButton();
    });
    document.getElementById('createBtn').addEventListener('click', (e) => {
        e.preventDefault();
        return createButton();
    });
    document.getElementById('active-deck').addEventListener('change', (e) => {
        removeElements(document.querySelectorAll('.card-box'));
        document.getElementById('active-deck').value === 'netrunnerdb' ? displayCards(randomCards(remoteCards, 52)) : displayButton();
    });
});

/**************************************************************************
********SEARCH/RANDOM/DISPLAY/DELETE/CREATE FUNCTIONALITY******************
**************************************************************************/

function searchButton() {
  
    //get filtered cards
    const activeDeck = document.getElementById('active-deck').value;
    const activeCards = cardsFromDeck(activeDeck);
    const filteredCards = filters(activeCards);
  
    //resets form elements
    document.getElementById('search').reset();

    //populate with new boxes containing filtered cards
    if(filteredCards.length > 100) {
        removeElements(document.querySelectorAll('.card-box'));
        displayCards(randomCards(filteredCards, 50));
        return tooManyAlert();
    } else {
        return displayCards(filteredCards);
    }
};

function randomButton() {
    
    //get filtered cards
    const activeDeck = document.getElementById('active-deck').value;
    const activeCards = cardsFromDeck(activeDeck);
    const filteredCards = filters(activeCards);
    
    //populate with new boxes containing filtered cards
    return displayCards(randomCards(filteredCards, 1));
};

function displayButton() {
  
    //get cards
    const activeDeck = document.getElementById('active-deck').value;
    const activeCards = cardsFromDeck(activeDeck);

    //populate with new boxes containing filtered cards
    if(activeCards.length > 100) {
        randomButton();
        return tooManyAlert();
    } else {
        return displayCards(activeCards);
    }
};

function deleteButton() {

    //get active deck Id
    const activeDeck = document.getElementById('active-deck').value;
    const activeDeckId = objectId(activeDeck, localDecks);
    
    //delete active deck
    return fetch(`http://localhost:3000/decks/${activeDeckId}`, {
        'method': 'DELETE'
    });
};

function createButton() {
    const newDeckField = document.createElement('input');
    newDeckField.id = 'deck-input';
    newDeckField.placeholder = 'Deck name';
    newDeckField.classList.add('disposable');

    const spacer = document.createElement('div');
    spacer.classList.add('spacer');

    const newDeckCreateBtn = document.createElement('button');
    newDeckCreateBtn.id = 'createBtn';
    newDeckCreateBtn.textContent = 'submit deck';
    newDeckCreateBtn.classList.add('disposable');
    newDeckCreateBtn.classList.add('new-form-buttons');
    newDeckCreateBtn.addEventListener('click', (e) => newDeckCreateButton());

    document.getElementById('create-form').appendChild(newDeckField);
    document.getElementById('create-form').appendChild(spacer);
    document.getElementById('create-form').appendChild(newDeckCreateBtn);
    return;
};
      
function newDeckCreateButton() {
    const newDeckName = document.getElementById('deck-input').value
    const emptyDeck = {
        'name': newDeckName,
        'value': newDeckName,
        'cards': []
    };
    return fetch("http://localhost:3000/decks/", {
        'method': 'POST',
        'headers': {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        'body': JSON.stringify(emptyDeck)
    })
    .catch((error) => {
        console.error('Error posting new deck:', error);
    });
};

/**************************************************************************
*************************************FILTER FUNCTIONALITY******************
**************************************************************************/

function filters(cards) {
    return searchFilter(cardTypeFilter(factionFilter(cards)));
};

function factionFilter(cards) {
    const activeFaction = document.getElementById('active-faction').value;
    if(activeFaction === 'all') {
        return cards;
    } else if (activeFaction === 'corp' || activeFaction === 'runner') {
        return cards.filter(function (el) {
            return el.side_code === `${activeFaction}`;
        });
    } else {
        return cards.filter(function (el) {
            return el.faction_code === `${activeFaction}`
        });
    }
};

function cardTypeFilter(cards) {
    const activeCardType = document.getElementById('active-card-type').value;
    if(activeCardType === 'any') {
        return cards;
    } else {
        return cards.filter(function (el) {
            return el.type_code === `${activeCardType}`;
        });
    }
};

function searchFilter(cards) {
    if(document.querySelector('#card_name').value === undefined) {
        return cards;
    } else {
        return cards.filter(function (el) {
            return el.title.toLowerCase().includes(document.querySelector('#card_name').value.toLowerCase());
        });
    }
};

/**************************************************************************
**************RANDOM CARD FUNCTIONS****************************************
**************************************************************************/

function randomCards(cards, number) {
    let numberOfCards = -1;
    cards.length < number ? numberOfCards = cards.length : numberOfCards = number;
    const randomCards = [];
    for(i = 1; i <= numberOfCards; i++) {
        let randNumber = randIndex(cards.length);
        randomCards.push(cards[randNumber]);
    };
    return randomCards;
};

function randIndex(arrayLength) {
    let randIndex = Math.floor(Math.random() * (arrayLength));
    return randIndex;
};

/**************************************************************************
********************CREATES THE CARDBOXES FOR DISPLAY**********************
**************************************************************************/

function createCardBox(card) {

    const cardBox = document.createElement('div');
    cardBox.classList.add('card-box');
    cardBox.id = `${card.code}`;

    const cardImg = document.createElement('img');
    cardImg.classList.add('card-image');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${card.code}.jpg`;
 
    const cardName = document.createElement('h3');
    cardName.textContent = `${card.title}`;

    const faction = document.createElement('p');
    faction.textContent = `faction: ${card.faction_code}`;

    const horLine = document.createElement('hr');
    horLine.classList.add('demarcation');

    const modifyDeckSelect = document.createElement('select');
    modifyDeckSelect.id = 'collection-add';
    localDecks.forEach((e) => addOption(e, modifyDeckSelect));
    const activeDeck = localDecks.filter((e) => e.name === document.getElementById('active-deck').value);
    const activeDeckIndex = localDecks.indexOf(activeDeck[0]);
    modifyDeckSelect.selectedIndex = activeDeckIndex;

    const addBtn = document.createElement('button');
    addBtn.classList.add('addBtn');
    addBtn.textContent = 'Add to Deck';
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addButton(card, modifyDeckSelect.value);
        alert(`${card.title} added to ${modifyDeckSelect.value}`);
    });

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('removeBtn');
    removeBtn.textContent = 'Remove from Deck';
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeButton(card, modifyDeckSelect.value);
        alert(`${card.title} removed from ${modifyDeckSelect.value}`)
    });

    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(faction);
    cardBox.appendChild(horLine);
    cardBox.appendChild(modifyDeckSelect);
    cardBox.appendChild(addBtn);
    cardBox.appendChild(removeBtn);

    return cardBox;
};

/**************************************************************************
********************ADD CARD/REMOVE CARD FUNCTIONALTY**********************
**************************************************************************/

function addButton(card, deckName) {
    const deckCards = cardsFromDeck(deckName);
    const deckId = objectId(deckName, localDecks);
    deckCards.push(card);

    return fetch(`http://localhost:3000/decks/${deckId}`, {
        'method': 'PATCH',
        'headers': {
        "Content-Type": "application/json",
        Accept: "application/json"
        },
        'body': JSON.stringify({
            "cards": deckCards
        })
    });
};

function removeButton(card, deckName) {
    const deckCards = cardsFromDeck(deckName);
    const deckId = objectId(deckName, localDecks);
    const cardIndex = deckCards.indexOf(card);
    deckCards.splice(cardIndex, 1);
    document.getElementById(`${card.code}`).remove();
    return fetch(`http://localhost:3000/decks/${deckId}`, {
        'method': 'PATCH',
        'headers': {
        "Content-Type": "application/json",
        Accept: "application/json"
        },
        'body': JSON.stringify({
            "cards": deckCards
        })
    });
};

/**************************************************************************
**********************************FETCH GET FUNCTIONS**********************
**************************************************************************/

function fetchData(dataSource) {
    if(dataSource === 'remote') {
        return genericFetch("https://netrunnerdb.com/api/2.0/public/cards")
        .then((response) => response.json())
        .then((data) => data.data)
        .catch((error) => console.error('Fetch netrunnerdb Error:', error));
    } else if(dataSource === 'local') {
        return genericFetch(`http://localhost:3000/decks/${activeDeckId()}`)
        .then((response) => response.json())
        .then((data) => data.cards)
        .catch((error) => console.error('Fetch local cards Error:', error));;
    } else {
        return genericFetch(`http://localhost:3000/decks`)
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error('Fetch local decks Error:', error));;
    }
};

function genericFetch(url) {
    return fetch(`${url}`, {
        headers: {
            Accept: "application/json"
        }
    }); 
};

/**************************************************************************
******************MISC. APP SPECIFIC FUNCTIONS*****************************
**************************************************************************/

function activeDeckId() {
    const activeDeckName = document.getElementById('active-deck').value;
    const deckLocation = localDecks;
    return objectId(activeDeckName, deckLocation);
};

//returns id of current deck
function objectId(objectName, location) {
    const targetObj = location.filter((e) => e.name === objectName);
    return targetObj[0].id;
};

function cardsFromDeck(deckName) {
    if(deckName === 'netrunnerdb') {
        return remoteCards;
    } else {
        const deck = localDecks.filter((e) => e.name === deckName);
        return deck[0].cards;
    }
};

function tooManyAlert() {
    return alert("Too Many Cards to Display");
};
    
function displayCards(cards) {
    const cardArea = document.getElementById('cardblock');
    return cards.forEach((e) => cardArea.appendChild(createCardBox(e)));
};

/**************************************************************************
******************GENERAL PURPOSED FUNCTIONS*******************************
**************************************************************************/

function addOption(option, selectElement) {
    const newOption = document.createElement('option');
    newOption.value = option.name;
    newOption.textContent = option.name;
    newOption.classList.add('new-deck');
    return selectElement.appendChild(newOption);
};

function removeElements(elementArray) {
    return elementArray.forEach((e) => e.remove());
};