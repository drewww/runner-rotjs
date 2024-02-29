
import { Being, GameState, IGame } from '../index.ts';
import * as ROT from 'rot-js'; // Import the 'rot-js' package

export class Player extends Being {
    game: IGame;

    public health: number = 5;

    constructor(game:IGame) {
        // don't need to have a valid position for the player to make the object
        super(-1, -1, "@", "#ff0", "#000");
        this.game = game;
    }

    act(): void {
        if (this.game.engine) {
            console.log("Locking for input.");
            this.game.engine.lock();
        } else {
            console.error("Game object missing engine.");
        }

        super.act();
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        console.log("[PLAYER] took damage, health now " + this.health);
        
        if (this.health <= 0) {
            this.game.switchState(GameState.KILLSCREEN);
        }
    }

    // the way ROT.js wants to do vision is async. That makes me ... uncomfortable? But lets roll
    // with it and see if I can live with that oddness.
    updateVision(): void {
        if(!this.level) { return; }

        let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            return this.level!.pointTransparent(x, y);
        });

        // set all tiles to not visible
        this.level!.resetPlayerVisibility();

        fov.compute(this.x, this.y, 10, (x, y, r, visibility) => {
            if (visibility > 0) {
                // case to be made to put this into a method on tile and call
                // discovered from there ...
                this.level!.map.getTile(x, y).visible = true;
                this.level!.map.getTile(x, y).discovered = true;
            }
        });
    }
}