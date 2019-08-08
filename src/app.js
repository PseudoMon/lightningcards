const Container = require('./container.riot').default
const HeadNav = require('./headnav.riot').default
const FooterNav = require('./footernav.riot').default
const ImportExporter = require('./importexporter.riot').default
const CardEdit = require('./cardedit.riot').default
const PlayingContainer = require('./playing/playing-container.riot').default
const DeckEditContainer = require('./deck-view/deckeditcontainer.riot').default
const MainMenu = require('./main-menu.riot').default

const { registerPreprocessor, register, mount } = require('riot')

// Get our Deck object
// It contains all the card data and functions
// Is this basically our back-end? Ha!
const deck = require('./store.js')

// Registering all the main components
// Some components are registered in their parent components' file
register('container', Container)
register('headnav', HeadNav)
register('footernav', FooterNav)
register('import-exporter', ImportExporter)
register('card-edit', CardEdit)
register('playing-container', PlayingContainer)
register('deck-edit-container', DeckEditContainer)
register('main-menu', MainMenu)

// Mounting the main app
mount('container', {deck: deck})
