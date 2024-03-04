
import { COLORS } from '../colors.ts';
import * as ROT from 'rot-js'; // Import the 'rot-js' package
import { Being } from './being.ts';
import { JUMP, LONG_WALL_JUMP, Move, WALL_RUN_R } from './move/move.ts';

export class Player extends Being {
    public health: number = 10;

    public depth: number = -3;
    private callbacks: {
        [key:string]: Function[]
    } = {};
    
    public moves: Move[] = []; 

    constructor() {
        // don't need to have a valid position for the player to make the object
        super(-1, -1, "@", COLORS.YELLOW, COLORS.WHITE);

        this.moves.push({name: "(J)ump", template:JUMP, cooldown: 0});
        this.moves.push({name: "(W)all run", template:WALL_RUN_R, cooldown: 0});
        this.moves.push({name: "(L)ong wall jump", template:LONG_WALL_JUMP, cooldown: 0});
    }


    addListener(type: string, callback: Function): void {
        let values = this.callbacks[type];
        
        if(!values) {
            values = [];
        }

        values.push(callback);
        this.callbacks[type] = values;
    }

    private fireListeners(type: string): void {
        const values = this.callbacks[type];
        if(values) {
            values.forEach(callback => callback(this));
        }
    }

    act(): void {
        super.act();
        this.fireListeners("act");
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        console.log("[PLAYER] took damage, health now " + this.health);
        
        if (this.health <= 0) {
            this.fireListeners("death");
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
                const tile = this.level!.map.getTile(x, y);

                if(tile) {
                    tile.visible = true;
                    tile.discovered = true;
                }
            }
        });
    }
}