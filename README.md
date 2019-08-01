# Lightning Cards
Lightning Cards is a frontend-only flash card web app made with [Riot v4](https://riot.js.org). Lightning Cards is built to be simple, easy to use, and playable on both desktop and mobile.

This app is partly inspired by [Anki](https://apps.ankiweb.net/), a pretty good flash card app, but one that I just can't bring myself to use because of its complicated interface, especially when creating new cards. It's also inspired by [Wanikani](https://apps.ankiweb.net/), [Torii SRS](https://apps.ankiweb.net/), and [Duolingo](https://duolingo.com).

I made Lightning Cards because I want to have a flashcard app where I can quickly make my own cards and just quickly play through them. This is probably my largest coding project so far, since it's the first web app I made that I've worked on for more than a few days.

At the moment, the app is usable with basic functionalities built in. It doesn't yet locally save your deck, but you can manually export the deck data as JSON and import it later.

# The Big To-Do List:
- Routing
- Archive cards
- Save deck to cache/cookie
- Confirmation for importing cards
- Error notification
- Add Less preprocessing (for easier recoloring, etc)
- Spaced repetition system

# Running the thing
I've set up `npm start` to get Browserify to watch the source files and automatically build everything into `bundle.js`.

This Github project uses GitHub Pages, so you can just try out the latest pushed build by going to [https://pseudomon.github.io/lightningcards].  
