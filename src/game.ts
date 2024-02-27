
import * as ROT from 'rot-js';
import {Player} from './index'
import { Enemy } from './enemy';

type GameMap = { [key: string]: string };

export class Game {
    display: ROT.Display;
    
    map: GameMap = {};

    w: number = 80;
    h: number = 24;

    player: Player | null = null;

    engine: ROT.Engine | null = null;
    enemy: Enemy | null = null;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());

        this._generateMap();
    }

    init() {
        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.enemy, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
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

        const freeCells = Object.keys(this.map).filter(key => this.map[key] === ".");
        
        this._drawWholeMap();
        this.createPlayer(freeCells);

        freeCells.splice(freeCells.indexOf(this.player!.getPosition()), 1);

        this.createEnemy(freeCells);
    }

    private createEnemy(freeCells: string[]) {
        const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        const key = freeCells[index];
        const parts = key.split(",");
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        this.enemy = new Enemy(x, y, this);
    }

    private createPlayer(freeCells: string[]): void {
        const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        const key = freeCells[index];
        const parts = key.split(",");
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        this.player = new Player(x, y, this);
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

export const G = new Game();
G.init();