# netflix-ratings-tab

A Firefox add-on that adds an additional \"Ratings and Reviews\" tab when expanding a show's details on Netflix.com. When viewing a show's details, this extension scrapes ratings and reviews from Rotten Tomatos and IMDB, and displays that info in a container view that seamlessly integrates with the rest of netflix's UI.

Netflix used to have its own user reviews feature but removed it a while back, most likely because the reviews were deterring users from watching more content. Netflix is really about maximizing the amount of hours that viewers watch; whether or not the viewers actually like the content is a secondary concern for them. But as a user I have different priorities. I want to know whether or not to invest my time into watching something. This extension is my attempt to solve that issue.

This extension does not store or collect your personal data in any way.

## Building
Install dependencies with npm.
```bash
npm install
```

Run the build scripts. (uses parceljs and zip)
```bash
npm run build
```

The generated files will be placed in the `/build` directory and a packaged .zip file will be generated in the `/dist` folder.

