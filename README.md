# Lightning Cards
Lightning Cards is a frontend-only flash card web app made with [Riot v4](https://riot.js.org) and [Skeleton](http://getskeleton.com/). Lightning Cards is built to be simple, easy to use, and playable on both desktop and mobile.

This app is partly inspired by [Anki](https://apps.ankiweb.net/), a pretty good flash card app, but one that I just can't bring myself to use because of its complicated interface, especially when creating new cards. It's also inspired by [Wanikani](https://apps.ankiweb.net/), [Torii SRS](https://apps.ankiweb.net/), and [Duolingo](https://duolingo.com).

I made Lightning Cards because I want to have a flashcard app where I can quickly make my own cards and just quickly play through them. This is probably my largest coding project so far, since it's the first web app I made that I've worked on for more than a few days.

It took about three weeks (give or take some days off) to get to V1.0. God, that's a lot of time wasted on this project.

This project is in version 1.0, which means it has all the functionalities that I need. It might still have bugs and there are a couple of features that I'm thinking of adding, but for now it's finished, ok, it's done.

# Features
- Quick practice sessions on desktop: You don't have to touch the mouse at all when practicing.
- Easily create and edit your own cards.
- Use UTF-8 and powered by Google Fonts: It should work with any language that your browser supports.
- No backend whatsoever: Save the HTML/JS/CSS files and it'll work offline.
- Deck you make is automatically saved locally
- Switch between multiple decks. All decks are saved locally too.
- Import/Export deck with JSON

# The Maybe-I'll-Add-Them-Later Features List
- Routing
- Archive cards
- Error notification
- Add Less/Sass preprocessing (for easier recoloring, etc)
- Night mode / custom styles
- Spaced repetition system
- More keyboard shortcuts
- Dropbox/Google Drive integration

# Known Problems
- There's no routing, so clicking back or refresh will just unload the current page
- If you leave/refresh the page in the Deck List screen, it'll make a duplicate of your current deck when you return   

# Running the thing
This Github project uses GitHub Pages, so you can just try out the latest pushed build by going to [https://pseudomon.github.io/lightningcards].

If you want to play with the source, I've set up `npm start` to get Browserify to watch the source files and automatically build everything into `bundle.js`.
