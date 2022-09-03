# NISEI Deck Builder (beta)
A single-page application to help players of NISEI/Netrunner build their decks. 

## Description
NISEI/Netrunner is a fun collectible card game ([with an interesting publication history](https://spritesanddice.com/features/project-nisei-and-future-netrunner/)). With over 2,000 cards, building your own deck can be pretty intimidating. I designed this app to make that process a bit easier.

With the deck builder, you can search among the game's existing cards, create and delete your own decks, add/remove cards, and search within the decks.

The app uses the excellent [NetrunnerDB API](https://netrunnerdb.com/api/2.0/doc) to pull the full set of cards.

The project is currently in beta and I'd appreciate any feedback!

## Demo Video
[![A link to a demo video](https://timloughrist.files.wordpress.com/2022/09/ksnip_20220902-144258.png)](https://youtu.be/e5T7n_SJtcU)

## Installation
The current version of the app simulates a server for storing deck information using [JSON-server](https://www.npmjs.com/package/json-server).

To install JSON-server, navigate in terminal to the directory where you've cloned this repository and run:
```
npm install -g json-server
```
To start the server, run:
```
json-server --watch db.json
```
Obviously, you'll need to change the href for both the css and the JavaScript files in index.html.

## Usage
I hope the app is mostly self-explanatory, but here are some notes just the same.

**Search for cards:** select the deck you want to search (netrunnerDB is the database of all the cards), apply the filters you want (each is optional), then hit 'search'. If the search returns too many cards (over 100), you'll receive an alert.

**Display random card:** same as above, but hit 'random' rather than 'search'. A single card meeting your filter criteria will be displayed.

**Display a deck:** select the deck you want to display and hit 'display deck'. Note that decks over 100 cards will not display and you'll receive an alert.

**Delete a deck:** select the deck you'd like to delete and hit 'delete current deck'. Note that netrunnerDB cannot be deleted.

**Create a new deck:** hit 'create new deck' and two additional elements will appear: a field to enter the deck name and a 'submit deck' button. Simply enter the deck name and hit submit. Note that there are currently no name validations in place.

**Add a card to a deck:** on the desired card, select the desired deck and hit 'add to deck'. You'll get an alert letting you know it was successful.

**Remove a card from a deck:** on the desired card, select the desired deck and hit 'remove from deck'. You'll get an alert letting you know it was successful.

## Support
If you have any questions about the app or suggestions, please send me an email at tim.loughrist@gmail.com.

## Roadmap
In the future, I'd like to add the following features:

1. Display information about the active deck, e.g., number of cards, faction, agenda points, etc.
2. Validate whether the deck is legal.
3. Validate deck names, prevent duplicates, etc.
4. Validate card-adds, preventing duplicates, illegal adds, etc.
5. Include an element on each card to select how many of that card you'd like to add or remove.
6. Print a card list of all the cards in a deck.
7. A card magnifying glass.
8. Preload winning decks from past tournaments.
9. When custom decks are created or deleted, reload local decks, repopulate options without reloading page.
10. Build a permanent API to store custom deck information.
11. Logins to keep the custom decks of different users separate.

## Contributing
If anyone wants to fork this repo and work on the app, I'd love to see what you do with it!

## Authors and acknowledgment
I've been lucky to have the help of instructors at the [Flatiron coding bootcamp](https://flatironschool.com/welcome-to-flatiron-school/?utm_source=Google&utm_medium=ppc&utm_campaign=12728169833&utm_content=127574232664&utm_term=flatiron&uqaid=513747011248&CjwKCAjwsMGYBhAEEiwAGUXJafADpgJFbJ4--7MTNBIDgpVzlW_ojAyku7GlAFULzRS0BW5RBpdGFBoCjNEQAvD_BwE&gclid=CjwKCAjwsMGYBhAEEiwAGUXJafADpgJFbJ4--7MTNBIDgpVzlW_ojAyku7GlAFULzRS0BW5RBpdGFBoCjNEQAvD_BwE). I've also benefited greatly from running code past my friend, [Patrick Lindsay](https://www.linkedin.com/in/thomaspatricklindsay/). Much love to the insanely dedicated folk of [NISEI](https://nisei.net/) and to [Richard Garfield](https://en.wikipedia.org/wiki/Richard_Garfield).