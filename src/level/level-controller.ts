

import { Drawable, LevelType, Point, Light } from '..';
import { COLORS } from '../colors';
import * as ROT from 'rot-js'; // Import the 'rot-js' package
import { Being } from '../entities/being';
import { Player } from '../entities/player';
import { Button } from './button';
import { Door } from './door';
import { GameMap } from './game-map';
import { PatrolBot } from '../entities/patrol-bot';
import { Color } from 'rot-js/lib/color';
import { MoveOption } from '../entities/move/move';
import { BSPGameMap } from './bsp-game-map';
import { Tile } from './tile';
import { Hunter } from '../entities/hunter';


export class LevelController implements Drawable {
    public map: GameMap;
    private beings: Being[];

    public scheduler = new ROT.Scheduler.Simple();

    public w: number = 80;
    public h: number = 23;

    public x: number = 0;
    public y: number = 0;

    public player: Player | null = null;
    private firstTurnRender = false;
    turnCounter: number;
    hunter: Hunter | null = null;

    // put the logic for different types of levels in here
    constructor(type: LevelType, w: number, h: number) {
        this.beings = [];

        this.w = w;
        this.h = h;

        this.turnCounter = 0;
        
        // TODO move all this into separate GameMap extending classes
        switch (type) {
            case LevelType.CAVE:
                this.map = new GameMap(this.w, this.h);
                this.map.generateDiggerMap();

                for (let i = 0; i < 4; i++) {
                    const freeCells = this.getEmptyPoints();
                    if (!freeCells) {
                        console.error("No free cells to place enemy.");
                        break;
                    }
                    const enemyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    this.createEnemy(enemyCell);

                    freeCells.splice(freeCells.indexOf(enemyCell), 1);
                }

                for(let i=0; i<2; i++) {
                    const freeCells = this.getEmptyPoints();
                    if (!freeCells) {
                        console.error("No free cells to place button.");
                        break;
                    }

                    const buttonCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    this.map.setTile(new Button(buttonCell.x, buttonCell.y));
                }

                for(let i=0; i<4; i++) {
                    const freeCells = this.getEmptyPoints();
                    if (!freeCells) {
                        console.error("No free cells to place door.");
                        break;
                    }

                    const doorCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    this.map.setTile(new Door(doorCell.x, doorCell.y));
                }

                break;
            case LevelType.DEBUG:
                this.map = new BSPGameMap(this.w, this.h);

                // this.map.getAllTiles().forEach(tile => {
                //     tile.discovered = true;

                // });

                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });

                break;
            case LevelType.RANDOM:
                this.map = new GameMap(this.w, this.h);
                this.map.generateTrivialMap();

              
                // generate a bunch of enemies
                for (let i = 0; i < 8; i++) {
                    const freeCells = this.map.getFreePoints();
                    if (!freeCells) {
                        console.error("No free cells to place enemy.");
                        break;
                    }
                    const enemyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    const enemy = new PatrolBot(enemyCell.x, enemyCell.y, "random");
                    this.addBeing(enemy);
                }

                break;
        }


        // add a listener to all tiles??? this feels overkill. 
        this.map.getAllTiles().forEach(tile => {
            if(tile instanceof Button) {
                tile.addListener("button", (tile: Button) => {
                    const forcefields = this.map.getAllTiles().filter(t => t.symbol === "#");

                    // for a random forecfield tile, turn it into a floor tile.
                    const t = forcefields[Math.floor(Math.random() * forcefields.length)];
                    if(t) {
                        const position = {x: t.x, y: t.y};
                        this.map.setTile(new Tile(position.x, position.y, "FLOOR"));
                    }
                });
            }

        })
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

    public draw(display: ROT.Display, xOffset:number, yOffset:number, bg:string): void {
        const tiles = this.map.getAllTiles();
        const lightMap = this.mergeLightMaps();
        for (const tile of tiles) {            
           this.drawTile(tile, display, xOffset, yOffset, lightMap);
        }

       if(this.turnCounter==0 && !this.firstTurnRender) {
            // draw a path from the player to each of the buttons
            const buttons = this.map.getAllTiles().filter(tile => tile.type === "BUTTON");

            for(var button of buttons) {
                // kick off a pathing animation

                const path = new ROT.Path.AStar(button.x, button.y, (x, y) => {
                    // ignore the actual map, the point is not to show the path just to make an animation
                    return true;
                });

                var timesCalled = 0;
                path.compute(this.player!.x, this.player!.y, (x, y) => {
                    timesCalled++;
                    setTimeout(() => {
                        // TODO this is not working if there is other vision shown
                        display.drawOver(x, y, null, null, COLORS.LIGHT_GREEN);
                    }, timesCalled*10+100);

                    // setTimeout(() => {
                    //     this.drawTile(this.map.getTile(x, y), display, xOffset, yOffset, lightMap);
                    // }, timesCalled*10 + 1000);
                });

                button.discovered = true;
                button.visible = true;

                this.firstTurnRender = true;
                this.draw(display, xOffset, yOffset, bg);
            }
        }

        if(this.player && this.player.triggerPulse) {
            // look for hunter.
            if(this.hunter) {
                //calculate distance
                const distance = Math.floor(Math.sqrt(Math.pow(Math.abs(this.hunter.x - this.player.x), 2) +
                    Math.pow(Math.abs(this.hunter.y - this.player.y), 2)));
                console.log("distance: " + distance);

                // kick off an animation pulse of circles
                for(let r=1; r<=distance; r++) {
                    // calculate the points for the radius.

                    let points: Point[] = [];
                    for(let a=0; a<Math.PI*2; a+=Math.PI/80) {
                       points.push({x:Math.floor(r*Math.cos(a)), y:Math.floor(r*Math.sin(a))}); 
                    }

                    points = points.filter((point, index) => points.indexOf(point) === index);

                    setTimeout(() => {
                        for(let point of points) {
                            display.drawOver(point.x + this.player!.x, point.y + this.player!.y, " ", COLORS.LASER_RED, COLORS.LASER_RED);
                        }
                    }, r*50);

                    if(r==distance) {
                        for(let i=0; i<50; i++) {
                            setTimeout(() => {
                                for(let point of points) {
                                    display.drawOver(point.x + this.player!.x, point.y + this.player!.y, " ", COLORS.LASER_RED, COLORS.LASER_RED);
                                } 
                            }, i);
                        }
                    }


                    // setTimeout(() => {
                    //     for(let point of points) {
                    //         display.drawOver(point.x + this.player!.x, point.y + this.player!.y, " ", COLORS.LASER_RED, COLORS.LASER_RED);
                    //     }
                    // }, r*150);
                }
            }
        }   
    }

    private drawTile(tile:Tile, display:ROT.Display, xOffset:number, yOffset:number, lightMap: { [key: string]: Light }) {
         // if not discovered, skip it.
         if (!tile.discovered) {
            return;
        }


        let fg = tile.fg;
        let bg = tile.bg;

        if(tile.visible) {
            const key = `${tile.x},${tile.y}`;
            if(key in lightMap) {
                bg = lightMap[`${tile.x},${tile.y}`].color;
            } else {
                bg = COLORS.BLACK;
            }
        } else {
            // let fgHSL = ROT.Color.rgb2hsl(ROT.Color.fromString(fg));
            // fgHSL[2] = fgHSL[2]-0.5;  
            // fg = ROT.Color.hsl2rgb(fgHSL).toString();  
            fg = COLORS.INVISIBLE_TILE;
        }

        if (tile.opaque) {
            bg = tile.bg;
        }

        // if(tile.indestructable) {
        //     fg = COLORS.WHITE;
        //     bg = COLORS.WHITE;
        // }

        // TODO check in on the offset math here
        // I think this might need xOffset and we're just getting lucky that it's 0 in the current
        // UI design
        display.draw(tile.x + this.x, tile.y + this.y, tile.symbol, fg, bg);


        for (let being of this.beings) {
            // ah this is failing sometimes when beings get created OUTSIDE the boundaries.
            const t = this.map.getTile(being.x, being.y);

            if(!t) {
                console.error("being at invalid location", being.x, being.y, being);
            }

            if (t && t.visible) {
                let bg = COLORS.BLACK;
                const key = `${being.x},${being.y}`;
                if (key in lightMap) {
                    bg = lightMap[key].color;
                }

                being.draw(display, this.x, this.y, bg);
            }
        }

        // render destination moves
        const selectedMoveOptions: MoveOption[] = this.player?.selectedMoveOptions ?? [];
        
        // should be length 0 or length 4
        let i=1;
        for (const selectedMove of selectedMoveOptions) {
            const lastStep = selectedMove.moves[selectedMove.moves.length - 1];
            display.draw(lastStep.x + this.x + this.player!.x, lastStep.y + this.y + this.player!.y, selectedMove.symbol, COLORS.WHITE, COLORS.MOVE_BLUE);
            i++;
        }
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

        // if (this.player) {
        //     occupiedTiles.push(this.player.getPosition());
        // }

        return occupiedTiles;
    }

    private mergeLightMaps(): { [key: string]: Light } {
        let beingLight: Light[] = [];

        for (let being of this.beings) {
            beingLight.push(...being.getLight());
        }

        const lightMapSources: { [key: string]: Light[] } = {};

        // right now this is overwriting multiple lights on the same tile.
        // TODO fix later
        for (const light of beingLight) {
            var existing = lightMapSources[`${light.p.x},${light.p.y}`];

            if(existing) {
                existing.push(light);
            } else {
                existing = [light];
            }
            lightMapSources[`${light.p.x},${light.p.y}`] = existing;
        }

        // so first we produce the lightmap, which has a list of lights for each tile
        // then do another pass which computes a single color per tile.
        const lightMap: { [key: string]: Light } = {};

        for (let key in lightMapSources) {
            let bg = COLORS.BLACK;

            if (key in lightMapSources) {
                const EMPTY_COLOR: Color = [-1, -1, -1];
                let finalTileColor: Color = EMPTY_COLOR;
                const tileLightSources: Light[] = lightMapSources[key];
    
                for (let tileLightSource of tileLightSources) {
                    if (finalTileColor === EMPTY_COLOR) {
                        finalTileColor = ROT.Color.fromString(tileLightSource.color);
                    } else {
                        finalTileColor = ROT.Color.add(finalTileColor, ROT.Color.fromString(tileLightSource.color));
                    }
                }
    
                bg = ROT.Color.toHex(finalTileColor).toString();
            }
    
            lightMap[key] = { p: { x: parseInt(key.split(",")[0]), y: parseInt(key.split(",")[1]) },
                intensity: 10, color: bg};
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
        this.addBeing(new PatrolBot(p.x, p.y));
    }

    public setPlayer(player: Player): void {
        this.player = player;
        this.player.setLevel(this);

        // look for if the level has an entrance. if it does, move the player there.
        const entranceTiles = this.map.getAllTiles().filter(tile => tile.procGenType === "ENTRANCE");
        if (entranceTiles.length > 0) {
            const entrance = entranceTiles[Math.floor(Math.random() * entranceTiles.length)];
            player.setPosition({x: entrance.x, y: entrance.y});
        }        

        this.scheduler.add(player, true);
        this.beings.push(player);

        this.turnCounter = 0;

        this.player.addListener("move", () => {
            this.map.latestPlayerPosition = {x:this.player!.x, y:this.player!.y};
            this.turnCounter++;

            if(this.turnCounter == 20) {
                console.log("-----------HUNTER ENTERING----------");

                const entranceTiles = this.map.getAllTiles().filter(tile => tile.procGenType === "ENTRANCE");

                if(entranceTiles) {
                    const hunter = new Hunter(entranceTiles[0].x, entranceTiles[0].y, this.map); 
                    hunter.queueNextMove();
                    this.hunter = hunter;
                    this.addBeing(hunter);
                }
            }
        });
    }

    public disable(): void {
        // this is plausible copilot generated code but i'm not actually sure what I need
        // to do here (if anything).
        // when I have animations in the main game this is probably where they get stopped. 
        // for (const being of this.beings) {
        //     this.scheduler.remove(being);
        // }
    }


}
