# Angular-Drum-Machine

A drum machine entirely made in HTML5, AngularJS and Foundation.

A little fun without server side logic.

Composed by a classic, 16 step pattern grid with percussive wav samples, and an 8 bit style, lo-fi synth driven by 2 oscillators.

_NEW: MIDI support on Chrome!_

[Live demo!](http://www.massimobarbieri.it/AngularDrumMachine)

Browser support: MS Internet Explorer does not support audio: please try with MS Edge, Mozilla, Chrome, Safari or another browser.

## A note on local use

If you download the files and open index.html with Chrome, it will NOT work. 

This is due to Chrome limitations on XMLHttpRequest to local files.

To fix this, you can:

* Use another browser like Mozilla, OR
* Use a local web server, for example: IIS / IIS Express, Apache, Node.js, nginx, Gunicorn, ... OR
* Use Chrome with local web security disabled (option --allow-file-access-from-files)

Copyright (C) 2015, [Massimo Barbieri](http://www.massimobarbieri.it)
