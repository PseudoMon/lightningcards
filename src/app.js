const Container = require('./container.riot').default
const HeadNav = require('./headnav.riot').default
const ImportExporter = require('./importexporter.riot').default
const CardEdit = require('./cardedit.riot').default
const PlayingContainer = require('./playing/playing-container.riot').default
const DeckEditContainer = require('./deckeditcontainer.riot').default
const MainMenu = require('./main-menu.riot').default

const { registerPreprocessor, register, mount } = require('riot')

// Get our Deck object
// It contains all the card data and functions
// Is this basically our back-end? Ha!
const deck = require('./store.js')

// Registering all the components
// TODO: move the smaller components to their parents components
// this should just be for big components and utilities
register('container', Container)
register('headnav', HeadNav)
register('import-exporter', ImportExporter)
register('card-edit', CardEdit)
register('playing-container', PlayingContainer)
register('deck-edit-container', DeckEditContainer)
register('main-menu', MainMenu)

mount('container', {deck: deck})
