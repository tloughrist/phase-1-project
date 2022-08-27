const list = document.getElementById('json_data');

const printData = function (data) {
    const listItem = document.createElement('li');
    listItem.textContent = data;
    list.appendChild(listItem);    
};

const printImg = function (data) {
    const listItem = document.createElement('li');
    const cardImg = document.createElement('img');
    cardImg.src = `https://static.nrdbassets.com/v1/large/${data}.jpg`
    listItem.append(cardImg);
    list.appendChild(listItem);    
};

fetch("https://netrunnerdb.com/api/2.0/public/cards", {
    headers: {
        Accept: "application/json"
    }
})
.then((response) => response.json())
.then(function(data) {
    console.log(data.data);
    let randCardNum = Math.floor(Math.random() * (data.data.length - 1));
    const card = data.data[randCardNum];
    const keys = (Object.keys(card));
    const values = (Object.values(card));
    for (let i = 0; i < keys.length; i++) {
        printData(`${keys[i]}: ${values[i]}`);
    }
    printImg(card.code);
})
.catch((error) => {
    console.error('Error:', error);
});

//img url template: 'https://static.nrdbassets.com/v1/large/{code}.jpg'
