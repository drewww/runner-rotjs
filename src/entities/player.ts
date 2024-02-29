
import { Being, IGame } from '../index.ts';

export class Player extends Being {
    game: IGame;

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
}