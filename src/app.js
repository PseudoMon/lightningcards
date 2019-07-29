const Container = require('./container.riot').default
const HeadNav = require('./headnav.riot').default
const ImportExporter = require('./importexporter.riot').default
const CardDisplay = require('./carddisplay.riot').default
const CardEdit = require('./cardedit.riot').default
const Smh = require('./smh.riot').default
const DeckEditContainer = require('./deckeditcontainer.riot').default

const {component, register, mount, install} = require('riot')

const currentDeck = require('./store.js')

register('container', Container)
register('headnav', HeadNav)
register('import-exporter', ImportExporter)
register('card-display', CardDisplay)
register('card-edit', CardEdit)
register('smh', Smh)
register('deck-edit-container', DeckEditContainer)

mount('container', {deck: currentDeck})


/*
The Big To-Do List:
- Main Menu (!)
- Routing
- Removing card from deck (!)
- Archive cards
- Save deck to cache/cookie
- Confirmation for importing cards
- Correct/wrong counter
- Error notification
*/
