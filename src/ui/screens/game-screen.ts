import * as ROT from "rot-js"; // Import the 'rot-js' module
import { StatusBar } from "../elements/status-bar";
import { IGame, GameState, LevelType } from "../..";
import { Player } from "../../entities/player";
import { Level } from "../../level/level";
import { Interactable } from "../../level/tile";
import { Screen } from "../screen";
import { MoveMenuScreen } from './move-menu-screen';

export class GameScreen extends Screen {
    public level: Level;

    private game: IGame;
    statusBar: StatusBar | undefined;
    player: Player | undefined;

    engine: ROT.Engine;
    moveMenu: any;

    constructor(game: IGame) {
        super();

        // starter level. eventually this should be the "intro" level, but for now use the tutorial cave.
        this.game = game;

        // careful, the height here relates to the screen height.
        this.level = new Level(LevelType.DEBUG, 80, this.height-1);
        this.level.x = 0;
        this.level.y = 0;
        this.x = 0;
        this.y = 0;
        // this sets the render order, be careful.
        this.elements!.push(this.level);

        this.engine = new ROT.Engine(this.level.scheduler);
    }
    

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }

    handleEvent(e: KeyboardEvent): void {

        // this map operates with 0 being "up" and then rotates clockwise around from there.
        const keyMap: { [key: number]: number } = {};
        keyMap[ROT.KEYS.VK_NUMPAD8] = 0;
        keyMap[ROT.KEYS.VK_NUMPAD9] = 1;
        keyMap[ROT.KEYS.VK_NUMPAD6] = 2;
        keyMap[ROT.KEYS.VK_NUMPAD3] = 3;
        keyMap[ROT.KEYS.VK_NUMPAD2] = 4;
        keyMap[ROT.KEYS.VK_NUMPAD1] = 5;
        keyMap[ROT.KEYS.VK_NUMPAD4] = 6;
        keyMap[ROT.KEYS.VK_NUMPAD7] = 7;

        keyMap[ROT.KEYS.VK_W] = 0;
        keyMap[ROT.KEYS.VK_E] = 1;
        keyMap[ROT.KEYS.VK_D] = 2;
        keyMap[ROT.KEYS.VK_C] = 3;
        keyMap[ROT.KEYS.VK_X] = 4;
        keyMap[ROT.KEYS.VK_Z] = 5;
        keyMap[ROT.KEYS.VK_A] = 6;
        keyMap[ROT.KEYS.VK_Q] = 7;

        var code = e.keyCode;
        console.log("CODE: " + code);
        
        if (e.keyCode == ROT.KEYS.VK_NUMPAD5 || e.keyCode == ROT.KEYS.VK_S) {
            // wait
            console.log(`[player @${this.level.player!.getPosition().x},${this.level.player!.getPosition().y}] wait`);
            // check for adjacent interactables. 
            const playerPos = this.level.player!.getPosition();

            for (let xOffset = -1; xOffset <= 1; xOffset++) {
                for (let yOffset = -1; yOffset <= 1; yOffset++) {
                    if (xOffset === 0 && yOffset === 0) {
                        continue; // Skip the player's position
                    }

                    // TODO does this fail if you're adjacent to a map edge? maybe.
                    const adjacentTile = this.level.map.getTile(playerPos.x + xOffset, playerPos.y + yOffset);
                    if (adjacentTile && 'interact' in adjacentTile) {
                        (<Interactable>adjacentTile).interact(this.level.player!);
                    }
                }
            }
        } else if (code in keyMap) {

            var diff = ROT.DIRS[8][keyMap[code]];
            console.log(`[player @${this.level.player!.getPosition().x},${this.level.player!.getPosition().y}] move: ${diff[0]},${diff[1]}`);        
            this.level.player!.move(diff[0], diff[1]);  
        } else if (code >= ROT.KEYS.VK_1 && code <= ROT.KEYS.VK_9){
            console.log("move key pressed");
            this.level.player!.selectMove(code - ROT.KEYS.VK_1);
            
            // if this is the same as a move already selected, it will execute it.
        } else if (code == ROT.KEYS.VK_ESCAPE) {
            this.level.player!.deselectMoves();
        }

        // this is async so ... start it and see what happens
        this.level.player!.updateVision();

        // check if anything happens based on where the player moved
        // 1. in enemy vision? take damage
        // 2. on the exit? win

        // check if the player is in the view areas of any enemies
        // this is a terrible stupid way to do this but it works for now
        const getEnemyVisiblePoints = this.level.getEnemyVisiblePoints();
        const pos = this.level.player!.getPosition();
        const posString = `${pos.x},${pos.y}`;

        if (getEnemyVisiblePoints.includes(posString)) {
            this.level.player!.takeDamage(1);
        }
        //-------------------//
        const curTile = this.level.map.getTile(this.level.player!.x, this.level.player!.y);
        
        // stupid that this depends on a specific character
        if (curTile && curTile.symbol === '%') {
            this.advanceDepth();
        }

        if(this.engine) {
            // window.removeEventListener("keydown", this);
            this.engine.unlock();
        }

        // moving refresh here seems to deal with the "first move" disappearing issue
        // seems okay to have this be our big refresh moment, but we'll see. the timing
        // issues on the FOV calculation still have me concerned and refreshing at the last moment
        // before acting seems nice. I'm also a little sure about whether this means
        // enemes will be shown in their "correct" place.
        this.game.refreshDisplay();
    }

    advanceDepth(): void {
        this.level.player!.depth++;
        if(this.level.player!.depth >= 0) {
            this.game.switchState(GameState.WINSCREEN);
        } else {
            // prepare another level.
            const newLevel = new Level(LevelType.CAVE, 80, this.height-1);

            this.level = newLevel;
            
            // does this prepend? tbd.
            this.elements = [this.level, this.statusBar!];

            // why do I keep rewriting this code -- abstract this at some point
            const freeCells = this.level.getEmptyPoints();
            if (!freeCells) {
                console.error("No free cells to place player.");
                return;
            } else {
                this.player!.setPosition(freeCells[Math.floor(Math.random() * freeCells.length)]);
            }
            
            this.level.setPlayer(this.player!);
            this.player!.updateVision();
    
            this.game.refreshDisplay();

            this.engine = new ROT.Engine(this.level.scheduler);
            this.engine.start();
            this.engine.lock();
        }
    }

    setPlayer(player: Player) {
        console.log("SETTING PLAYER");

        this.player = player;
        const freeCells = this.level.getEmptyPoints();
        if (!freeCells) {
            console.error("No free cells to place player.");
            return;
        }
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        player.setPosition(playerCell);

        this.level.setPlayer(player);   
        
        if(!this.statusBar) {
            this.statusBar = new StatusBar(0, this.height - 1, this.width, 1, player!);
            this.elements!.push(this.statusBar);
        } else {
            this.statusBar.player = player;
        }

        if(!this.moveMenu) {
            this.moveMenu = new MoveMenuScreen(0, 0, player);
            this.moveMenu.x = this.width - this.moveMenu.width;
            this.moveMenu.y = this.height - this.moveMenu.height;
            this.elements!.push(this.moveMenu);
        } else {
            this.moveMenu.setPlayer(player);
        }

        this.player.addListener("act", (player:Player) => {
            this.engine.lock();
        });

        this.player.addListener("death", (player:Player) => {
            this.game.switchState(GameState.KILLSCREEN);
        });
    }
}