// Utility function to shuffle array
// Using the Fisher-Yates shuffle
// Thanks academia!
function shuffle(oldArray) {
  let array = oldArray.slice(0)
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }

  return array
}

class Card {
  constructor(cardData) {
    this.front = cardData.front || ''
    this.back = cardData.back || ''
    this.subFront = cardData.subFront || ''
    this.subBack = cardData.subBack || ''
    this.synFront = cardData.synFront || []
    this.synBack = cardData.synBack || []
    this.totalRight = cardData.totalRight || 0
    this.totalWrong = cardData.totalWrong || 0

    // synFront/Back is synonym for front/back.
    /// So you can add that as an alternate answer
    /// when typing into the textbox
  }

  changeFront(newText) {
    this.front = newText
  }

  changeBack(newText) {
    this.back = newText
  }

  addRight() {
    this.totalRight++
  }

  addWrong() {
    this.totalWrong++
  }

  addSyn(side, synonym) {
    // side should be either 'front' or 'back'
    switch(side) {
      case 'front':
        this.synFront.push(synonym)
        break
      case 'back':
        this.synBack.push(synonym)
        break
      default:
        console.log("Seems like you're trying to add a synonym to a nonexistent side, boyo")
    }
  }

  removeSyn(side, i) {
    switch(side) {
      case 'front':
        this.synFront.splice(i, 1)
        break
      case 'back':
        this.synBack.splice(i, 1)
        break
      default:
        console.log("Seems like you're trying to add a synonym to a nonexistent side, boyo")
    }
  }
}

let sampleCards = [
  new Card({
    front: "éclair",
    back: "flash of lightning",
    synBack: ["lightning"]
  }),
  new Card({
    front: "雷",
    back: "thunder",
    synBack: ["thunder", "lightning", "thunderbolt"]
  }),
  new Card({
    front: "kilat",
    back: "lightning",
    synFront: ["petir"],
  })
]

class Deck {
  // Deck contains all the cards that can be played.
  // "100 French Words" or "JLPT N4 Vocabulary" would be a Deck
  // The deck of cards currently being played
  // is in currentSession.deck

  constructor(cards) {
    this.name = "Sample Cards"
    this.cards = cards || sampleCards
    this.currentSession = {
      deck: this.cards.slice(0),
      correctCounter: 0,
      playedCounter: 0,
      setting: 'default',
    }
    this.currentSession.totalCount = this.cards.length
  }

  addCard(cardData) {
    let newCard = new Card(cardData)
    this.cards.push(newCard)
    return newCard
  }

  shuffleAllCards() {
    let allCards = this.cards.slice(0)
    this.currentSession.deck = shuffle(allCards)
    this.currentSession.totalCount = allCards.length
  }

  startNewSession(setting='default') {
    this.currentSession.correctCounter = 0
    this.currentSession.playedCounter = 0
    this.currentSession.setting = setting
    this.shuffleAllCards()
  }

  drawCard() {
    // return a card from the end and remove it from the deck
    return this.currentSession.deck.pop()
  }

  removeCard(i) {
    this.cards.splice(i, 1)
  }

  changeName(newName) {
    this.name = newName
  }

  replaceDeck(deckData) {
    // Changing name
    this.changeName(deckData.name)
    const newCards = deckData.cards

    // Emptying cards in the Deck
    this.cards = []

    // Putting in all the new cards
    newCards.forEach((card) => {
      this.addCard(card)
    })

    // Shuffling the new deck
    this.shuffleAllCards()
  }

  saveToLocalStorage() {
    //holy shit is it really this easy??
    let cards = this.cards
    let deck = { name: this.name, cards: cards }
    let exportedDeck = JSON.stringify(deck)
    localStorage.setItem("deck", exportedDeck)
  }

  getFromLocalStorage() {
    const deckToImport = localStorage.getItem("deck")

    // If there's no data stored, return
    if (!deckToImport) { return }

    // Else, import it
    const importedDeck = JSON.parse(deckToImport)

    this.replaceDeck(importedDeck)
  }

  getLocalDecks() {
    // This function retrieve all saved deck data
    // and return them without processing
    const decksData = localStorage.getItem("alldecks")

    // If there's no data stored, return
    if (!decksData) { return }

    return decksData
  }

  saveCurrentDeckToLocalDecks() {
    // Local Decks is just all the decks currently saved in Local Storage
    // This method is useful for when you want to change the current deck
    const cards = this.cards
    const deck = { name: this.name, cards: cards }

    const oldDecks = JSON.parse(localStorage.getItem("alldecks"))
    let newDecks

    // If there's none stored yet, make a new array
    if (oldDecks) {
      newDecks = oldDecks.concat([deck])
    }
    else {
      newDecks = [deck]
    }

    localStorage.setItem("alldecks", JSON.stringify(newDecks))
  }

  removeFromLocalDecks(i) {
    let newDecks = JSON.parse(localStorage.getItem("alldecks")).slice()
    newDecks.splice(i, 1)
    localStorage.setItem("alldecks", JSON.stringify(newDecks))
  }

  destroyLocalDecks() {
    localStorage.removeItem("alldecks")
  }

}

const currentDeck = new Deck(sampleCards)


module.exports = currentDeck
