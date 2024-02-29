

import { Drawable, Enemy, GameMap, LevelType, Light, Player, Point } from '../index';
import { Being } from '../index';
import * as ROT from 'rot-js'; // Import the 'rot-js' package

export class Level implements Drawable {
    public map: GameMap;
    private beings: Being[];

    public scheduler = new ROT.Scheduler.Simple();

    protected w: number = 80;
    protected h: number = 23;

    public x: number = 0;
    public y: number = 0;

    public player: Player | null = null;

    // put the logic for different types of levels in here
    constructor(type: LevelType, w: number, h: number) {
        this.beings = [];

        this.w = w;
        this.h = h;
        
        switch(type) {
            case LevelType.CAVE:
                this.map = new GameMap(80, 24);
                this.map.generateDiggerMap();
        
                for(let i = 0; i < 4; i++) {
                    const freeCells = this.getEmptyPoints();
                    if (!freeCells) {
                        console.error("No free cells to place enemy.");
                        break;
                    }
                    const enemyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    this.createEnemy(enemyCell);
            
                    freeCells.splice(freeCells.indexOf(enemyCell), 1);    
                }
        
                break;
            case LevelType.DEBUG:
                this.map = new GameMap(80, 24);
                this.map.generateTrivialMap();
                break;
        }
    }

    // Methods specific to managing a specific level
    // on ice for now, may re-implement later
    // public loadLevel(): void {
    //     // Code to load the level from a file or database
    // }

    // public saveLevel(): void {
    //     // Code to save the level to a file or database
    // }

    public addBeing(being: Being): void {
        being.setLevel(this);
        this.beings.push(being);
        this.scheduler.add(being, true);
    }

    public removeBeing(being: Being): void {
        const index = this.beings.indexOf(being);
        if (index !== -1) {
            this.beings.splice(index, 1);
        }
    }

    public getBeings(): Being[] {
        return this.beings;
    }

    public draw(display: ROT.Display): void {
        const tiles = this.map.getAllTiles();
        const lightMap = this.mergeLightMaps();
        for (const tile of tiles) {

            // if not discovered, skip it.
            if (!tile.discovered) {
                continue;
            }

            // TODO make the background color draw from a "light" map that is maintained separately
            let bg = "#000";
            const key = `${tile.x},${tile.y}`;
            if (key in lightMap) {
                bg = lightMap[key].color;
            }

            let fg = tile.fg;

            if(!tile.visible) {
                // let fgHSL = ROT.Color.rgb2hsl(ROT.Color.fromString(fg));
                // fgHSL[2] = fgHSL[2]-0.5;  
                // fg = ROT.Color.hsl2rgb(fgHSL).toString();  
                fg = "#555";
            }

            display.draw(tile.x + this.x, tile.y + this.y, tile.symbol, fg, bg);
        }

        for(let being of this.beings) {
            being.draw(display, this.x, this.y);
        }

        this.player!.draw(display, this.x, this.y);
    }

    public pointPassable(x: number, y: number) {
        const tile = this.map.getTile(x, y);
        return tile && !tile.solid && !this.isBeingOccupyingPoint(x, y);
    }

    private isBeingOccupyingPoint(x: number, y: number): boolean {
        for (const being of this.beings) {
            const position = being.getPosition();
            if (position.x === x && position.y === y) {
                return true;
            }
        }

        // if (this.player) {
        //     const playerPosition = this.player.getPosition();
        //     if (playerPosition.x === x && playerPosition.y === y) {
        //         return true;
        //     }
        // }

        return false;
    }

    public resetPlayerVisibility() {
        for (const tile of this.map.getAllTiles()) {
            tile.visible = false;
        }
    }

    public pointTransparent(x:number, y:number) {
        const tile = this.map.getTile(x, y);
        return tile && !tile.opaque;
    }

    public getEmptyPoints(): Point[] {
        const tiles = this.map.getFreePoints();

        // now remove from that list all known beings
        const occupiedTiles = this.getBeingOccupiedTiles();
        const emptyTiles = tiles.filter(tile => !occupiedTiles.some(occupiedTile => occupiedTile.x === tile.x && occupiedTile.y === tile.y));

        return emptyTiles;
    }

    private getBeingOccupiedTiles(): Point[] {
        const occupiedTiles: Point[] = [];

        for (const being of this.beings) {
            occupiedTiles.push(being.getPosition());
        }

        if (this.player) {
            occupiedTiles.push(this.player.getPosition());
        }

        return occupiedTiles;
    }

    private mergeLightMaps(): { [key: string]: Light } {
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

    public getEnemyVisiblePoints(): string[] {
        // this is assuming lighting is the same thing as vision ... that may 
        // be a bad assumption.

        const lightMap = Object.values(this.mergeLightMaps());
        return lightMap.map(light => `${light.p.x},${light.p.y}`);
    }

    private createEnemy(p: Point): void {        
        this.addBeing(new Enemy(p.x, p.y));
    }

    public setPlayer(player: Player): void {
        this.player = player;
        this.player.setLevel(this);
        this.scheduler.add(player, true);
    }
}
