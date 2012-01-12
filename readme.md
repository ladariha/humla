# Humla

Humla is an open source presentation & lecture hosting environment based on [node.js](http://nodejs.org) server. 
As a presentation frontend, or as we call it a 'client', it uses beautiful HTML5 slides inspired by HTML5Rocks,
but with many extra features (Comments, Likes, Tests...).

Similarly as Beamer exist for Latexers, Humla'a aim is to provide environment for creating slides for presentations in HTML while 
utilizing extensive HTML5 features. Humla is particularly useful for technical presentations and was originally created
as a tool for the Czech Technical University courses Middleware and Web Services and Web 2.0. 

Humla is easy extendable by client and/or server extensions (or plugins if you mind).

To see Humla in action, see <a href="http://vitvar.com/courses/mdw/slides/lecture1.html">Lecture 1 of 
Web Services and Middleware</a> course.


We are currently working on server API, IDE, semantic analyzers and other stuff.

Feel free to fork Humla, write plugins and patch it yourself!
  

# Features

  * Every slide has a unique URL.
  * Plugin architecture with views and extensions. 
  * A view allows to define the way how slides are presented; there is currently a browsing view 
    for convenient slides browsing, a slideshow view for presentations, a grid view for overview of slides in a presentation,
    and a print view for printing slides.
  * An extension defines processing of slides' content such as for replacment of variables, online integration with pictures from 
    Google Drawing, online integration with github to display a code, Latex formulas, etc.

# Server Features
  * Comments under each slide
  * Like button under each slide
  * Share presentation on facebook, google+, etc.
  * RSS channels for all courses or per course


# Browser Support

Humla currently works and is tested on the latest versions of Chrome and Safari - but we hope to support other browsers soon.

# Installation

You may use humla client (HTML5 frontend) as a standalone library then please follow these steps:

/TODO: setup
Via git (or downloaded tarball):

    $ git clone git@github.com:tomvit/humla.git

After Humla has been downloaded, go to the humla directory and update submodules:

    $ git submodule update --init --recursive

## Requirements
  - NodeJS server
  - Express framework 
  - MongoDB DB
  - JSDOM module


# Usage

To run `test.html` in examples locally, you need to start your browser with options to run XHR on
local files. For example, to enable Chrome to run XHR on local files start it with the argument 
`--args --allow-file-access-from-files`. If you can access `test.html` at a Web server, 
just point your browser to it.

Use the following keys to navigate in the presentation:

  * `1` switches to the browser view
  * `2` switches to the slideshow view
  * `3` switches to the grid view
  * `4` or `p` switches to the print view
  * `5` switches to the editor view
  * `left`, `right` goes to the previous and next slide respectively
  * `e` shows the last error if any
  * `d` toggles the debug mode
  * `i` shows presentation content

See <a href="http://vitvar.com/courses/mdw/slides/lecture1.html">Lecture 1 of Web Services and Middleware</a> 
course for more information on how Humla can be used for making presentations.


# License
The GPL version 3, http://www.gnu.org/licenses/gpl.txt
