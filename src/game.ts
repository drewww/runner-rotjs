
import * as ROT from 'rot-js';
import { GameMap, Point } from './index';
import {Player} from './index'
import {Enemy} from './index';


export class Game {
    display: ROT.Display;

    map!: GameMap;

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

        scheduler.add(this.enemy, true);
        scheduler.add(this.player, true);

        // scheduler.add({ act: () => {
        //     this._drawWholeMap();
        // }}, true);

        this.engine = new ROT.Engine(scheduler);
        this._drawWholeMap();

        this.engine.start();
        console.log("Engine started.");
    }

    private _generateMap(): void {
        this.map = new GameMap(this.w, this.h);    
        this.map.generateDiggerMap();
        
        // this.map.generateTrivialMap();

        this._drawWholeMap();

        const freeCells = this.map.getFreePoints();
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.createPlayer(playerCell);
        freeCells.splice(freeCells.indexOf(this.player!.getPosition()), 1);

        const enemyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.createEnemy(enemyCell);
    }

    private createEnemy(p: Point): void {        
        this.enemy = new Enemy(p.x, p.y, this);
    }

    private createPlayer(p:Point): void {
        this.player = new Player(p.x, p.y, this);
    }

    private _drawWholeMap(): void {
        const tiles = this.map.getAllTiles();
        for (const tile of tiles) {
            // TODO make the background color draw from a "light" map that is maintained separately
            this.display!.draw(tile.x, tile.y, tile.symbol, tile.fg, "#000");
        }
    }
}

export const G = new Game();
G.init();