//arrays to locally hold data from APIs
const localDecks = [];
const remoteCards = [];

//populates the localDecks, active deck select and remoteCards arrays
fetchData('decks')
.then((result) => localDecks.push(...result))
.then(() => localDecks.forEach((e) => {
    addOption(e, document.getElementById('active-deck'))
})
);

fetchData('remote')
.then((result) => remoteCards.push(...result));

//assign event listeners to non-card buttons present on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        searchButton();
        //resets form elements
        document.getElementById('search').reset();
    });
    document.getElementById('randomBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        randomButton();
    });
    document.getElementById('displayBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeElements(document.querySelectorAll('.card-box'));
        displayButton();
    });
    document.getElementById('removeBtn').addEventListener('click', (e) => {
        deleteButton();
    });
    document.getElementById('createBtn').addEventListener('click', (e) => {
        e.preventDefault();
        createButton();
    });
});

//functionality when search button is clicked
function searchButton() {
  
    //get filtered cards
    const activeDeck = document.getElementById('active-deck').value;
    const activeCards = cardsFromDeck(activeDeck);
    const filteredCards = filters(activeCards);
  
    //populate with new boxes containing filtered cards
    if(filteredCards.length > 100) {
        randomButton();
        return tooManyAlert();
    } else {
        return displayCards(filteredCards);
    }
};

//functionality when random button is clicked
function randomButton() {
    
    //get filtered cards
    const activeDeck = document.getElementById('active-deck').value;
    const activeCards = cardsFromDeck(activeDeck);
    const filteredCards = filters(activeCards);
    
    //populate with new boxes containing filtered cards
    return displayCards(randomCards(filteredCards, 1));
};

//functionality when display button is clicked
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

//functionality when delete button is clicked
function deleteButton() {

    //get active deck Id
    const activeDeck = document.getElementById('active-deck').value;
    const activeDeckId = objectId(activeDeck, localDecks);
    
    //delete active deck
    return fetch(`http://localhost:3000/decks/${activeDeckId}`, {
        'method': 'DELETE'
    })
};

//functionality when create button is clicked
function createButton() {
    const newDeckField = document.createElement('input');
    newDeckField.id = 'deck-input';
    newDeckField.placeholder = 'Deck name';
    newDeckField.classList.add('disposable');

    const newDeckCreateBtn = document.createElement('button');
    newDeckCreateBtn.id = 'createBtn';
    newDeckCreateBtn.textContent = 'Submit Deck';
    newDeckCreateBtn.classList.add('disposable');
    newDeckCreateBtn.addEventListener('click', (e) => {
        newDeckCreateButton();
    });

    document.getElementById('create-form').appendChild(newDeckField);
    document.getElementById('create-form').appendChild(newDeckCreateBtn);
};

//add options to a select element
function addOption(option, selectElement) {
    const newOption = document.createElement('option');
    newOption.id = option.name;
    newOption.value = option.name;
    newOption.textContent = option.name;
    newOption.classList.add('new-deck');
    return selectElement.appendChild(newOption);
};
      
//returns a promise of updating the json-server
function newDeckCreateButton() {
    
    const newDeckName = document.getElementById('deck-input').value

    //Build empty deck
    const emptyDeck = {
        'name': newDeckName,
        'value': newDeckName,
        'cards': []
    };

    //creates new object in json-server
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

//gets the cards from the named deck
function cardsFromDeck(deckName) {
    if(deckName === 'netrunnerdb') {
        return remoteCards;
    } else {
        const deck = localDecks.filter((e) => e.name === deckName);
        return deck[0].cards;
    }
};

//applies all filters
function filters(cards) {
    return searchFilter(cardTypeFilter(factionFilter(cards)));
};

//filters cards based on faction
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

//filters cards based on card type
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

//filters cards by search
function searchFilter(cards) {
    if(document.querySelector('#card_name').value === undefined) {
        return cards;
    } else {
        return cards.filter(function (el) {
            return el.title.toLowerCase().includes(document.querySelector('#card_name').value.toLowerCase());
        });
    }
};

//behavior if too many cards are called for
function tooManyAlert() {
    return alert("Too Many Cards to Display");
};
    
//removes current boxes
function removeElements(elementArray) {
    return elementArray.forEach((e) => {
        e.remove();
    });
};

//displays all the cards from a given array of cards
function displayCards(cards) {
    const cardArea = document.getElementById('cardblock');
    return cards.forEach((e) => {
        cardArea.appendChild(createCardBox(e));
    });
};

//returns a complete card box for display
function createCardBox(card) {

    //build the cardBox itself
    const cardBox = document.createElement('div');
    cardBox.classList.add('card-box');
    cardBox.id = `${card.code}`;

    //build the cardBox elements
    const cardImg = document.createElement('img');
    cardImg.classList.add('card-image');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${card.code}.jpg`;

    const cardName = document.createElement('h3');
    cardName.textContent = `${card.title}`;

    const faction = document.createElement('p');
    faction.textContent = `faction: ${card.faction_code}`;

    const horLine = document.createElement('hr');
    horLine.classList.add('demarcation');
    horLine.id = 'card-demarcator';

    const modifyDeckSelect = document.createElement('select');
    modifyDeckSelect.id = 'collection-add';
    localDecks.forEach((e) => {
        addOption(e, modifyDeckSelect);
    });

    const addBtn = document.createElement('button');
    addBtn.classList.add('addBtn');
    addBtn.textContent = 'Add to Deck';
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addButton(card, modifyDeckSelect.value)
        alert(`${card.title} added to ${modifyDeckSelect.value}`);
    });

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('removeBtn');
    removeBtn.textContent = 'Remove from Deck';
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeButton(card, modifyDeckSelect.value)
        alert(`${card.title} removed from ${modifyDeckSelect.value}`)
    });
    
    //append the elements
    cardBox.appendChild(cardImg);
    cardBox.appendChild(cardName);
    cardBox.appendChild(faction);
    cardBox.appendChild(horLine);
    cardBox.appendChild(modifyDeckSelect);
    cardBox.appendChild(addBtn);
    cardBox.appendChild(removeBtn);
    
    return cardBox;
};

//adds the current card to the named deck
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

//removes the current card from the named deck
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

//returns an array of a given length of random cards from a given array of cards
function randomCards(cards, number) {
    let numberOfCards = -1;
    if(cards.length < number) {
        numberOfCards = cards.length;
    } else {
        numberOfCards = number;
    }
    const randomCards = [];
    for(i = 1; i <= numberOfCards; i++) {
        let randNumber = randIndex(cards.length);
        randomCards.push(cards[randNumber]);
    };
    return randomCards;
};

//returns a random index from a given array provided the array
function randIndex(arrayLength) {
    let randIndex = Math.floor(Math.random() * (arrayLength));
    return randIndex;
};

//returns data from the designated source: local, remote, or decks
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

//generic json fetch GET request
function genericFetch(url) {
    return fetch(`${url}`, {
        headers: {
            Accept: "application/json"
        }
    }) 
};

//returns id of active deck
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