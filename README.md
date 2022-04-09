# visitcedarcity-backend

This project has two essential sides, functions and hosting. As a result of the vastly different deploy times of these sides I will tend to sperate the sides while deploying, for example:

firebase deploy --only hosting

-or-

firebase deploy --only functions

The functions side of this project is a primarily puppeteer based repository of scraping algorithms in pubsubs. A pubsub is a sort of scheduled and recurring set of code, for example many of these functions have an attribute that simple states "every 3 hours" this means exactly what you think. This way of using natural language to assign intervals makes it seem as if it will be easy to change and set up but will often have completely random errors when changing the interval string to something it doesnt quite understand. So before despairing try a different interval string.

To get functions started you will need to run:

npm i

-or-

yarn

inside the functions directory.

For hosting its very low maintenance and straightforward static site. It includes a simple interface for administration tasks and a router for app downloads.

Happy Hacking.
