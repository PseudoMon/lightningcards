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
    front: "bonjour",
    back: "good day",
    synFront: ["bonne journée"]
  }),
  new Card({
    front: "bonsoir",
    back: "good evening",
    synBack: ["good night"]
  }),
  new Card({
    front: "semain",
    back: "week",
  }),
  new Card({
    front: "année",
    back: "year",
  }),
  new Card({
    front: "pendule",
    back: "clock",
  }),
  new Card({
    front: "venir",
    back: "come",
  }),
  new Card({
    front: "laid",
    back: "ugly",
  }),
  new Card({
    front: "travailler",
    back: "work",
  }),
  new Card({
    front: "tasse de café",
    back: "cup of coffee",
  }),
  new Card({
    front: "mettre",
    back: "put",
  })
]

class Deck {
  // Deck contains all the cards that can be played.
  // "100 French Words" or "JLPT N4 Vocabulary" would be a Deck
  // The deck of cards currently being played
  // whereas cards are shuffled and drawn from
  // is cardsInDeck

  constructor(cards) {
    this.name = "Untitled Deck"
    this.cards = cards || sampleCards
    this.cardsInDeck = this.cards.slice(0)
  }

  addCard(cardData) {
    let newCard = new Card(cardData)
    this.cards.push(newCard)
    return newCard
  }

  shuffleAllCards() {
    let allCards = this.cards.slice(0)
    this.cardsInDeck = shuffle(allCards)
  }

  drawCard() {
    // return a card from the end and remove it from the deck
    return this.cardsInDeck.pop()
  }

  removeCard(i) {
    this.cards.splice(i, 1)
  }

  changeName(newName) {
    this.name = newName
  }
}

const currentDeck = new Deck(sampleCards)


module.exports = currentDeck
