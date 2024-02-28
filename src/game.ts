
import * as ROT from 'rot-js';
import { Being, GameMap, Light, Point } from './index';
import {Player} from './index'
import {Enemy} from './index';


export class Game {
    display: ROT.Display;

    map!: GameMap;

    w: number = 80;
    h: number = 24;

    player: Player | null = null;

    engine: ROT.Engine | null = null;

    beings: Being[] = [];

    // I can't figure out how to type this properly
    scheduler = null as any;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());
    }

    init() {
        
        this.scheduler = new ROT.Scheduler.Simple();
    
        // annoyingly, this does more than just make the map since player starting
        // position is in here. eventually pull this out and make map generation
        // distinct from populating player + beings.
        this.generateMap();

        this.scheduler.add(this.player, true);

        // TODO Eventually consider doing a dirty refresh, where specific cells are called as needing a refresh.
        // Performance may not matter here though.

        this.engine = new ROT.Engine(this.scheduler);

        this.refreshDisplay();

        this.engine.start();

        console.log("Engine started.");
    }

    refreshDisplay() {
        this.display.clear();
        this.drawWholeMap();
        this.player!.draw();
        
        for(let being of this.beings) {
            being.draw();
        }
    }

    private generateMap(): void {
        this.map = new GameMap(this.w, this.h);

        this.map.generateDiggerMap();        
        // this.map.generateTrivialMap();

        // do I need to call this anymore? test
        this.drawWholeMap();

        const freeCells = this.map.getFreePoints();
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.createPlayer(playerCell);
        freeCells.splice(freeCells.indexOf(this.player!.getPosition()), 1);

        for(let i = 0; i < 4; i++) {
            const enemyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
            this.createEnemy(enemyCell);
    
            freeCells.splice(freeCells.indexOf(enemyCell), 1);    
        }
    }

    private createEnemy(p: Point): void {        
        this.addBeing(new Enemy(p.x, p.y, this));
    }

    private createPlayer(p:Point): void {
        this.player = new Player(p.x, p.y, this);
    }

    private mergeLightMaps(): { [key: string]: Light } {
        // this should eventually iterate through all beings, but for now...
        // const playerLight = this.player!.getLight();
        let beingLight: Light[] = [];
        
        for(let being of this.beings) {
           beingLight.push(...being.getLight());
        }

        const lightMap: { [key: string]: Light } = {};

        // right now this is overwriting multiple lights on the same tile.
        // TODO fix later
        for (const light of beingLight) {
            lightMap[`${light.p.x},${light.p.y}`] = light;
        }
        
        return lightMap;
    }

    private drawWholeMap(): void {
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

    public addBeing(being: Being): void {
        this.beings.push(being);
        this.scheduler.add(being, true);
    }
}
export const G = new Game();
G.init();