
import * as ROT from 'rot-js';
import { GameMap, Light, Point } from './index';
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
        this.refreshDisplay();
    }

    init() {
        var scheduler = new ROT.Scheduler.Simple();
    
        scheduler.add(this.player, true);
        scheduler.add(this.enemy, true);
        scheduler.add({ act: () => {
            this.refreshDisplay();
        }}, true);

        // TODO Eventually consider doing a dirty refresh, where specific cells are called as needing a refresh.
        // Performance may not matter here though.

        this.engine = new ROT.Engine(scheduler);

        this.engine.start();
        console.log("Engine started.");
    }

    refreshDisplay() {
        this.display.clear();
        this._drawWholeMap();
        this.player!.draw();
        this.enemy!.draw();
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

    private mergeLightMaps(): { [key: string]: Light } {
        // this should eventually iterate through all beings, but for now...
        // const playerLight = this.player!.getLight();
        let enemyLight: Light[] = [];
        if(this.enemy) {
            enemyLight = this.enemy!.getLight();
        }
        const lightMap: { [key: string]: Light } = {};

        for (const light of enemyLight) {
            lightMap[`${light.p.x},${light.p.y}`] = light;
        }
        
        return lightMap;
    }

    private _drawWholeMap(): void {
        const tiles = this.map.getAllTiles();
        const lightMap = this.mergeLightMaps();
        for (const tile of tiles) {
            // TODO make the background color draw from a "light" map that is maintained separately
            let color = "#000";
            const key = `${tile.x},${tile.y}`;
            if (key in lightMap) {
                color = lightMap[key].color;
            }

            this.display!.draw(tile.x, tile.y, tile.symbol, tile.fg, color);
        }
    }
}

export const G = new Game();
G.init();