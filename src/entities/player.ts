
import { Being, GameState, IGame } from '../index.ts';

export class Player extends Being {
    game: IGame;

    health: number = 5;

    constructor(game:IGame) {
        // don't need to have a valid position for the player to make the object
        super(-1, -1, "@", "#ff0", "#000");
        this.game = game;
    }

    act(): void {
        this.game.refreshDisplay();

        if (this.game.engine) {
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
}