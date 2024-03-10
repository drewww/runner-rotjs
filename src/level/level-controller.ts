

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
import { Overlays } from '../ui/overlays';
import { EdgeRoomGameMap } from './edge-room-game-map';
import { LoadedGameMap } from './loaded-game-map';


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
    overlays: Overlays | null = null;

    public lastKeyStyle: string = "";

    public suppressObjectives: boolean = false;
    public type: LevelType;

    // put the logic for different types of levels in here
    constructor(type: LevelType, w: number, h: number, overlays: Overlays | null = null) {
        this.beings = [];

        this.w = w;
        this.h = h;

        this.overlays = overlays;

        this.turnCounter = 0;

        this.type = type;

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

                for (let i = 0; i < 2; i++) {
                    const freeCells = this.getEmptyPoints();
                    if (!freeCells) {
                        console.error("No free cells to place button.");
                        break;
                    }

                    const buttonCell = freeCells[Math.floor(Math.random() * freeCells.length)];
                    this.map.setTile(new Button(buttonCell.x, buttonCell.y));
                }

                for (let i = 0; i < 4; i++) {
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

                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });

                break;

            case LevelType.EDGE_ROOM:
                this.map = new EdgeRoomGameMap(this.w, this.h, 0);
                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });

                break;
            case LevelType.BSP:
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
            case LevelType.TUTORIAL:
                this.map = new LoadedGameMap("tutorial1");

                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });

                this.hunter = this.map.getBeings().find(being => being instanceof Hunter) as Hunter;

                this.suppressObjectives = true;
                break;
            case LevelType.INTRO:
                this.map = new LoadedGameMap("intro1");

                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });

                // this.hunter = this.map.getBeings().find(being => being instanceof Hunter) as Hunter;
                this.suppressObjectives = false;
                break;

            case LevelType.VAULT:
                this.map = new LoadedGameMap("vault");
                this.map.getBeings().forEach(being => {
                    this.addBeing(being);
                });
                this.suppressObjectives = false;

                const exitTile = this.map.getAllTiles().find(tile => tile.type === "EXIT");
                if (exitTile) {
                    exitTile.power = 0;
                    exitTile.enabled = true;
                    exitTile.solid = false;
                }
                
                break;
        }


        // add a listener to all tiles??? this feels overkill. 
        this.map.getAllTiles().forEach(tile => {
            if (tile instanceof Button) {
                tile.addListener("button", (tile: Button) => {
                    // const forcefields = this.map.getAllTiles().filter(t => t.type === "EXIT_FORCEFIELD");

                    const exitTile = this.map.getAllTiles().find(tile => tile.type === "EXIT");

                    if (exitTile) {

                        exitTile.power--;
                        if (exitTile.power == 0) {
                            exitTile.enabled = true;
                            exitTile.solid = false;

                            this.overlays?.addLayer("path-to-exit");
                            var timesCalled = 0;

                            if (exitTile) {
                                // this is the DESTINATION that we pass in here
                                const path = new ROT.Path.AStar(exitTile.x, exitTile.y, (x, y) => {
                                    // ignore the actual map, the point is not to show the path just to make an animation
                                    return true;
                                });

                                if (path) {
                                    var revealedExit = false;
                                    path.compute(this.player!.x, this.player!.y, (x, y) => {
                                        timesCalled++;
                                        setTimeout(() => {

                                            if (!this.overlays) { return; }

                                            this.overlays.setValueOnLayer("path-to-exit", x, y, COLORS.LIGHT_GREEN + "80");
                                            this.overlays.draw();

                                            const distanceToExit = Math.floor(Math.sqrt(Math.pow(Math.abs(exitTile.x - x), 2) +
                                                Math.pow(Math.abs(exitTile.y - y), 2)));

                                            if (distanceToExit <= 1 && !revealedExit) {
                                                // this.map.setTile(new Tile(exitTile.x, exitTile.y, "EXIT", true, true));
                                                for (let dx = -1; dx <= 1; dx++) {
                                                    for (let dy = -1; dy <= 1; dy++) {
                                                        const adjacentTile = this.map.getTile(exitTile.x + dx, exitTile.y + dy);
                                                        if (adjacentTile) {
                                                            adjacentTile.discovered = true;
                                                            adjacentTile.visible = true;
                                                        }
                                                    }
                                                }

                                                revealedExit = true;
                                            }
                                        }, timesCalled * 10 + 100);
                                    });
                                    setTimeout(() => {
                                        this.overlays?.startLayerFade("path-to-exit", 1000, 10, 0.9);
                                    }, 1000);
                                }
                            }

                        }
                    }
                });
            }
        });
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

    public showObjectivePathOverlays(): void {
        if (!this.overlays) { return; }

        const buttons = this.map.getAllTiles().filter(tile => tile.type === "BUTTON");

        this.overlays.addLayer("button-pathing");
        for (var button of buttons) {
            // kick off a pathing animation

            // this is the DESTINATION that we pass in here
            const path = new ROT.Path.AStar(button.x, button.y, (x, y) => {
                // ignore the actual map, the point is not to show the path just to make an animation
                return true;
            });

            var timesCalled = 0;
            path.compute(this.player!.x, this.player!.y, (x, y) => {
                timesCalled++;
                setTimeout(() => {
                    if (!this.overlays) { return; }

                    this.overlays.setValueOnLayer("button-pathing", x, y, COLORS.LIGHT_GREEN + "80");
                    this.overlays.draw();
                }, timesCalled * 10 + 100);
            });

            setTimeout(() => {
                if (!this.overlays) { return; }

                this.overlays.startLayerFade("button-pathing", 1000, 10, 0.9);
            }, 1000);

            button.discovered = true;
            button.visible = true;
        }
    }

    public draw(display: ROT.Display, xOffset: number, yOffset: number, bg: string): void {
        const tiles = this.map.getAllTiles();
        const lightMap = this.mergeLightMaps();
        for (const tile of tiles) {
            this.drawTile(tile, display, xOffset, yOffset, lightMap);
        }

        if (this.turnCounter == 0 && !this.firstTurnRender) {
            // draw a path from the player to each of the buttons

            if (!this.suppressObjectives) { this.showObjectivePathOverlays() };


            this.firstTurnRender = true;
            this.draw(display, xOffset, yOffset, bg);
        }


        if (this.player && this.player.triggerPulse && this.hunter?.active()) {
            // look for hunter.
            if (this.hunter) {
                //calculate distance
                const distance = Math.floor(Math.sqrt(Math.pow(Math.abs(this.hunter.x - this.player.x), 2) +
                    Math.pow(Math.abs(this.hunter.y - this.player.y), 2)));
                console.log("distance: " + distance);

                if (!this.overlays) { return; }


                // kick off an animation pulse of circles
                // for big distances this is .. a lot. do a max of 5 circles
                // start at 5 less than the max, or 1.
                for (let r = Math.max(distance - 3, 1); r <= distance; r++) {
                    // calculate the points for the radius.
                    // let r = distance;
                    let points: Point[] = [];


                    for (let a = 0; a <= Math.PI * 2; a += Math.PI / (4 * distance)) {
                        points.push({ x: Math.floor(r * Math.cos(a)), y: Math.floor(r * Math.sin(a)) });
                    }
                    console.log("pulsing for r=" + r + " points: " + points.length);

                    points = points.filter((point, index) => points.indexOf(point) === index);

                    this.overlays.addLayer("hunter-pulse");

                    setTimeout(() => {
                        for (let point of points) {
                            this.overlays!.setValueOnLayer("hunter-pulse", point.x + this.player!.x, point.y + this.player!.y,
                                COLORS.LASER_RED + Math.floor(0.9 * 255).toString(16))
                        }
                        this.overlays!.draw();

                    }, (3 - (distance - r)) * 50);

                }

                setTimeout(() => {
                    if (!this.overlays) { return; }
                    this.overlays.startLayerFade("hunter-pulse", 5000, 40, 0.9);
                }, 60);
            }
        }
    }

    private drawTile(tile: Tile, display: ROT.Display, xOffset: number, yOffset: number, lightMap: { [key: string]: Light }) {
        // if not discovered, skip it.
        if (!tile.discovered) {
            return;
        }


        let fg = tile.fg;
        let bg = tile.bg;

        if (tile.visible) {
            const key = `${tile.x},${tile.y}`;
            if (key in lightMap) {
                bg = lightMap[`${tile.x},${tile.y}`].color;
            } else {
                bg = COLORS.BLACK;
            }

            if (tile.type === "BOUNDARY" || tile.type === "WALL") {
                fg = COLORS.MID_GREY;
            }
        } else {
            // let fgHSL = ROT.Color.rgb2hsl(ROT.Color.fromString(fg));
            // fgHSL[2] = fgHSL[2]-0.5;  
            // fg = ROT.Color.hsl2rgb(fgHSL).toString();  
            if (tile.opaque) {
                fg = tile.fg


            } else {
                fg = COLORS.INVISIBLE_TILE;
            }
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

            if (!t) {
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
        let i = 1;
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

            if (existing) {
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

            var firstBeing: Being = lightMapSources[key][0].being;
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

            lightMap[key] = {
                p: { x: parseInt(key.split(",")[0]), y: parseInt(key.split(",")[1]) },
                intensity: 10, color: bg, being: firstBeing
            };
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
        // this.player.resetLevelCallbacks();
        this.player.setLevel(this);

        // look for if the level has an entrance. if it does, move the player there.
        const entranceTiles = this.map.getAllTiles().filter(tile => tile.type === "ENTRANCE");
        if (entranceTiles.length > 0) {
            const entrance = entranceTiles[Math.floor(Math.random() * entranceTiles.length)];
            player.setPosition({ x: entrance.x, y: entrance.y });
        }

        console.log("placed player: " + player.x + "," + player.y);

        if (this.type === LevelType.TUTORIAL) {
            this.player.depth = -1;
        } else {
            this.player.depth = -4;
        }

        this.scheduler.add(player, true);
        this.beings.push(player);


        console.log("beings: " + this.beings);

        this.turnCounter = 0;

        this.player.addListener("move", () => {
            this.map.latestPlayerPosition = { x: this.player!.x, y: this.player!.y };



            // if the player did a burrow, leave behind a door.
            // humiliating string comparison here
            if (this.player!.lastMoveName === "(6) Burrow--------") {

                // another humiliating move
                this.player!.lastMoveName = "";
                const moveVector = { x: this.player!.x - this.player!.lastPosition.x, y: this.player!.y - this.player!.lastPosition.y };

                this.map.setTile(new Door(this.player!.x - moveVector.x / 2, this.player!.y - moveVector.y / 2));
            }

            this.turnCounter++;

            if (this.turnCounter == 20 && !this.map.disableHunter) {
                console.log("-----------HUNTER ENTERING----------");

                const entranceTiles = this.map.getAllTiles().filter(tile => tile.type === "ENTRANCE");

                if (entranceTiles) {
                    const hunter = new Hunter(entranceTiles[0].x, entranceTiles[0].y, this.map);
                    hunter.queueNextMove();
                    this.hunter = hunter;
                    this.addBeing(hunter);
                }
            }
        });

        this.player.addListener("damage", (player: Player) => {
            console.log("add damage overlay");
            this.overlays?.addLayer("player-damage", COLORS.LASER_RED + "80");
            this.overlays?.draw();
            this.overlays?.startLayerFade("player-damage", 1000, 10, 0.9);
        });

        this.player.addListener("move", (player: Player) => {

            // amulet special case
            const tile = this.map.getTile(player.x, player.y);
            if (tile && tile.symbol === "*") {
                this.map.disableHunter = false;
                this.turnCounter = 19;
                tile.symbol = ".";
            }

            console.log("checking move damage safety");
            if (this.getEnemyVisiblePoints().includes(`${player.x},${player.y}`)) {
                // find the nearest enemy that is doing the shooting

                // search through the beings to find the one closest to this location
                // (a bit wasteful to run merge lightmaps again here ... TODO cache it)
                let sourceBeing: Being = this.mergeLightMaps()[`${player.x},${player.y}`].being!;

                if (sourceBeing) {
                    this.overlays?.addLayer("shot-line");

                    // this is the DESTINATION that we pass in here
                    const path = new ROT.Path.AStar(player.x, player.y, (x, y) => {
                        // ignore the actual map, the point is not to show the path just to make an animation
                        return true;
                    });

                    var timesCalled = 0;
                    path.compute(sourceBeing.x, sourceBeing.y, (x, y) => {
                        timesCalled++;
                        setTimeout(() => {
                            if (!this.overlays) { return; }

                            this.overlays.setValueOnLayer("shot-line", x, y, COLORS.WHITE + "FF");
                            this.overlays.draw();
                        }, timesCalled * 10 + 100);
                    });

                    setTimeout(() => {
                        if (!this.overlays) { return; }

                        this.overlays.startLayerFade("shot-line", 1000, 10, 0.9);
                    }, 140);

                    sourceBeing.stun(4);
                }

                // make an animtion of the shot
                //   1. draw a red line from the enemy to the player

                // disable the enemy so it doesn't contribution vision for 3 turns
                // or move for 3 turns

                player.takeDamage(1);
                player.interruptMoveChain();
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

        console.log("CLEARING SCHEDULER");
        this.scheduler.clear();
        this.hunter?.disable();
        this.hunter = null;
        this.beings = [];
        this.map.clear();
        this.beings = [];
    }

    public activateHunter(): void {
        this.hunter?.enable();
    }
}
