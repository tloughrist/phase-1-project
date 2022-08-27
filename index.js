const list = document.getElementById('json_data');

const printData = function (data) {
    const listItem = document.createElement('li');
    listItem.textContent = data;
    list.appendChild(listItem);    
};

const dataFetch = function (url) {
    console.log(url);
    fetch(url, {
        headers: {
            Accept: "application/json"
        }
    })
    .then((response) => response.json())
    .then(function(data) {
        for (const [key, value] of Object.entries(data)) {
            console.log(`${key}: ${value}`);
            printData(`${key}: ${value}`);
        }
        /*
        let keys = Object.keys(data);
        console.log(keys);
        let values = Object.values(data);
        for(let i = 0; i < keys.length; i++) {
            printData(`${keys[i]}:${values[i]}`);
        }
        */
    })
    .catch((error) => {
        console.error('Error:', error);
      });
};

dataFetch("https://www.dnd5eapi.co/api/ability-scores/cha");
printData('hello')