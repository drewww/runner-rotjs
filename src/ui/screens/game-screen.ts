import * as ROT from "rot-js"; // Import the 'rot-js' module
import { StatusBar } from "../status-bar";
import { IGame, GameState } from "../..";
import { Player } from "../../entities/player";
import { Level } from "../../level/level";
import { Interactable } from "../../level/tile";
import { Screen } from "../screen";


export class GameScreen extends Screen {
    public level: Level;

    private game: IGame;
    statusBar: StatusBar | undefined;

    constructor(level: Level, game: IGame) {
        super();
        this.level = level;
        this.game = game;

        level.x = 0;
        level.y = 0;
        
        // this sets the render order, be careful.
        this.elements!.push(this.level);
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }

    handleEvent(e: KeyboardEvent): void {
        // TODO line this up with what's in ROT.KEYS
        const keyMap: { [key: number]: number } = {};
        keyMap[104] = 0;
        keyMap[105] = 1;
        keyMap[102] = 2;
        keyMap[99] = 3;
        keyMap[98] = 4;
        keyMap[97] = 5;
        keyMap[100] = 6;
        keyMap[103] = 7;

        var code = e.keyCode;
        
        if(e.keyCode==ROT.KEYS.VK_NUMPAD5) {
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
        

        } else {
            if (!(code in keyMap)) { return; }

            var diff = ROT.DIRS[8][keyMap[code]];
            console.log(`[player @${this.level.player!.getPosition().x},${this.level.player!.getPosition().y}] move: ${diff[0]},${diff[1]}`);        
            this.level.player!.move(diff[0], diff[1]);    
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
        
        if (curTile && curTile.symbol === '>') {
            // later, move to a second level
            console.log("At the exit for this map!");
            this.game.switchState(GameState.WINSCREEN);
        }


        if(this.game.engine) {
            // window.removeEventListener("keydown", this);
            this.game.engine.unlock();
        }

        // moving refresh here seems to deal with the "first move" disappearing issue
        // seems okay to have this be our big refresh moment, but we'll see. the timing
        // issues on the FOV calculation still have me concerned and refreshing at the last moment
        // before acting seems nice. I'm also a little sure about whether this means
        // enemes will be shown in their "correct" place.
        this.game.refreshDisplay();
    }

    setPlayer(player: Player) {
        console.log("SETTING PLAYER")
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
    }
}