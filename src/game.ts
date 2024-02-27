
import * as ROT from 'rot-js';

type GameMap = { [key: string]: string };

class Game {
    display: ROT.Display;
    
    map: GameMap = {};

    w: number = 80;
    h: number = 24;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());

        this._generateMap();
    }

    private _generateMap(): void {
        const digger = new ROT.Map.Digger(this.w, this.h);

        const digCallback = (x: number, y: number, value: number): void => {
            if (value) { return; } // do not store walls (TODO consider if this makes sense for me??)

            const key = `${x},${y}`;
            this.map[key] = ".";

            // so this map approach is just storing the actual characters. where does color? background? properties? come in
        }

        // bind causes it to run in the context of the Game object.
        digger.create(digCallback.bind(this));

        this._drawWholeMap();
    }

    private _drawWholeMap(): void {
        for (const key in this.map) {
            const parts = key.split(",")

            const x = parseInt(parts[0]);
            const y = parseInt(parts[1]);

            this.display!.draw(x, y, this.map[key], "#fff", "#000");
        }
    }
}

const game = new Game();