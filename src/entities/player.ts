
import { COLORS } from '../colors.ts';
import * as ROT from 'rot-js'; // Import the 'rot-js' package
import { Being } from './being.ts';
import { JUMP, LONG_WALL_JUMP, Move, MoveManager, RUNNING_JUMP, WALL_RUN_R } from './move/move.ts';
import { Light, Point } from '../index.ts';

export class Player extends Being {
    public health: number = 10;

    public depth: number = -3;
    private callbacks: {
        [key:string]: Function[]
    } = {};
    
    public moves: Move[] = []; 

    // this is relative to the players location
    public selectedMoveOptions: Point[][];

    constructor() {
        // don't need to have a valid position for the player to make the object
        super(-1, -1, "@", COLORS.YELLOW, COLORS.WHITE);

        this.moves.push({name: "(1) Jump", template:JUMP, cooldown: 0, selected:false});
        this.moves.push({name: "(2) Wall run", template:WALL_RUN_R, cooldown: 0, selected:false});
        this.moves.push({name: "(3) Long wall jump", template:LONG_WALL_JUMP, cooldown: 0, selected:false});
        this.moves.push({name: "(4) Running jump", template:RUNNING_JUMP, cooldown: 0, selected:false})
    
        this.selectedMoveOptions = [];
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

    getSelectedMove(): Move | undefined {
        return this.moves.find(move => move.selected);
    }

    selectMove(index: number): void {
        const selectedMove = this.getSelectedMove();

        if(selectedMove) {
            // we're double-using the numbers here. there's move selection number,
            // then rotation number. 
            console.log("move confirmed: " + selectedMove.name);
            console.log("with rotation: " + index);

            // eventually I will need to select a move VARIANT which will be numbered as well. for now,
            // we're just going to accept the move as is.

            const selectedMoveSteps = this.selectedMoveOptions[index];

            // step through the moves
            // the trick here is that in multi step moves, what's stored in selectedMoveSteps
            // is relative to the ORIGINAL location. Not the "latest" location.
            // so lets say you have the following steps:
            // (1,0)
            // (3,0)
            //
            // that should get recomputed to be [(1,0), (2,0)]
            // because after the first move completes, the correct RELATIVE move is only two more steps. not three.
            
            
            for(let i = 0; i < selectedMoveSteps.length; i++) {
                let move = selectedMoveSteps[i];
                if(i>0) {
                    move = {x: selectedMoveSteps[i].x - selectedMoveSteps[i-1].x, y: selectedMoveSteps[i].y - selectedMoveSteps[i-1].y};
                }
                this.move(move.x, move.y);
            }

            // TODO execute code here
            // then cancel moove
            this.deselectMoves();
        } else {
            this.deselectMoves();
            this.moves[index].selected = true;
            console.log("move selected: " + this.moves[index].name);

            const moveResults = MoveManager.moveResults(this.level!, this.moves[index].template);   
            this.selectedMoveOptions = moveResults;
        }
    }

    deselectMoves() {
        const selectedMove = this.moves.find(move => move.selected);
        this.selectedMoveOptions = [];
        if(selectedMove) {
            selectedMove.selected = false;
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

    // REMEMBER always return lights in global coordinates
    getLight(): Light[] {
        // iterate through the selectedMoveResults list, and make a light for each.
        const lights: Light[] = [];
        this.selectedMoveOptions.forEach(rotation => {

            // TODO make last step brighter
            for (let step of rotation) {
                const light: Light = {
                    p: {x: this.x + step.x, y: this.y + step.y},
                    intensity: 1,
                    color: COLORS.MOVE_LIGHT_BLUE
                };
                lights.push(light);
            }
        });
        return lights;
    }
}