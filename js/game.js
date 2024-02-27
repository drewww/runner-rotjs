"use strict";
class Game {
    constructor() {
        this.display = null;
        this.map = {};
    }
    init() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
    }
    _generateMap() {
        const digger = new ROT.Map.Digger();
        const digCallback = (x, y, value) => {
            if (value) {
                return;
            } // do not store walls (TODO consider if this makes sense for me??)
            const key = `${x},${y}`;
            this.map[key] = ".";
            // so this map approach is just storing the actual characters. where does color? background? properties? come in
        };
        // bind causes it to run in the context of the Game object.
        digger.create(digCallback.bind(this));
        this._drawWholeMap();
    }
    _drawWholeMap() {
        for (const key in this.map) {
            const parts = key.split(",");
            const x = parseInt(parts[0]);
            const y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }
}
