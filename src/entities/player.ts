
import { COLORS } from '../colors.ts';
import * as ROT from 'rot-js'; // Import the 'rot-js' package
import { Being } from './being.ts';
import { BURROW, ENEMY_JUMP, ENEMY_JUMP_SHORTEN, JUMP, LONG_WALL_JUMP, LONG_WALL_JUMP_SHORTEN, Move, MoveManager, MoveOption, RUNNING_JUMP, RUNNING_JUMP_SHORTEN, WALL_RUN_R, WALL_RUN_SHORTEN } from './move/move.ts';
import { Light, Point } from '../index.ts';

export class Player extends Being {

    public health: number = 10 ;

    public depth: number = -3;
    public callbacks: {
        [key:string]: Function[]
    } = {};
    
    public moves: Move[] = []; 

    // this is relative to the players location
    public selectedMoveOptions: MoveOption[];
    protected interruptMoves: boolean;
    triggerPulse: boolean;
    lastMoveName: string;
    lastPosition: Point;

    constructor() {
        // don't need to have a valid position for the player to make the object
        super(-1, -1, "@", COLORS.YELLOW, COLORS.WHITE);

        this.moves.push({name: "(1) Jump----------", template:JUMP, cooldown: 0, selected:false, cooldownOnUse: 15});
        this.moves.push({name: "(2) Wall run------", template:WALL_RUN_R, cooldown: 0, selected:false, cooldownOnUse: 15, variants: WALL_RUN_SHORTEN});
        this.moves.push({name: "(3) Jump off wall-", template:LONG_WALL_JUMP, cooldown: 0, selected:false, cooldownOnUse: 15, variants: LONG_WALL_JUMP_SHORTEN});
        this.moves.push({name: "(4) Running jump--", template:RUNNING_JUMP, cooldown: 0, selected:false, cooldownOnUse: 20, variants: RUNNING_JUMP_SHORTEN});
        this.moves.push({name: "(5) Enemy jump----", template:ENEMY_JUMP, cooldown: 0, selected:false, cooldownOnUse: 20, variants: ENEMY_JUMP_SHORTEN});
        this.moves.push({name: "(6) Burrow--------", template:BURROW, cooldown: 0, selected:false, cooldownOnUse: 80});

        this.selectedMoveOptions = [];
        this.triggerPulse = false;
        this.interruptMoves = false;
        this.lastPosition = {x: -1, y: -1};

        this.lastMoveName = "";
    }

    resetLevelCallbacks() {
        this.callbacks["move"] = [];
        this.callbacks["damage"] = [];
        // this.callbacks["act"] = [];
    }


    addListener(type: string, callback: Function): void {
        let values = this.callbacks[type];
        
        if(!values) {
            values = [];
        }

        values.push(callback);
        this.callbacks[type] = values;
    }

    private emit(type: string): void {
        const values = this.callbacks[type];
        if(values) {
            values.forEach(callback => callback(this));
        }
    }

    resetCooldowns(): void {
        this.moves.forEach(move => {
            move.cooldown = 0;
        });
    }

    move(dX: number, dY: number): boolean {
        this.lastPosition = {x: this.x, y: this.y};

        const superDidMove = super.move(dX, dY);

        if(superDidMove || (dX==0 && dY==0)) {
            this.emit("move");
        }
        
        if(dX==0 && dY == 0) {
            this.triggerPulse = true;
        } else {
            this.triggerPulse = false;
        }

        return superDidMove;
    }

    getSelectedMove(): Move | undefined {
        return this.moves.find(move => move.selected);
    }

    // this method is overloaded in a way. it can receive numbers (if it's selecting a move index)
    // or it can receive letters (if it's selecting a move rotation) or it can receive numpad keys (TODO)
    selectMove(symbol: string): boolean {
        const selectedMove = this.getSelectedMove();

        // if the player already has a move selected, then there are two options -- if they select a valid
        // directional symbol, execute the move. if they select anything else, abort the move.
        if(selectedMove) {
            // we're double-using the numbers here. there's move selection number,
            // then rotation number. 
            console.log("trying to move: " + selectedMove.name + "with rotation: " + symbol);
            this.interruptMoves = false;
            // eventually I will need to select a move VARIANT which will be numbered as well. for now,
            // we're just going to accept the move as is.

            const selectedMoveOption = this.selectedMoveOptions.find(move => move.symbol == symbol);

            if(!selectedMoveOption) {
                console.log ("Not a valid move option symbol. Resetting move selection.");


                this.deselectMoves();
                // if(symbol in ["1","2","3","4","5","6"]) {
                //     console.log("valid move option symbol, but not the selected option. Re-select.");
                //     this.selectMove(symbol);
                // }

                return false;
            }

            // otherwise, if the key matches one oft he valid move options, execute the move.

            // step through the moves
            // the trick here is that in multi step moves, what's stored in selectedMoveSteps
            // is relative to the ORIGINAL location. Not the "latest" location.
            // so lets say you have the following steps:
            // (1,0)
            // (3,0)
            //
            // that should get recomputed to be [(1,0), (2,0)]
            // because after the first move completes, the correct RELATIVE move is only two more steps. not three.
            
            // TODO THIS IS WHERE TO WORK

            selectedMove.cooldown = selectedMove.cooldownOnUse;

            for(let i = 0; i < selectedMoveOption.moves.length; i++) {
                if(this.interruptMoves) { break; }
                let move = selectedMoveOption.moves[i];
                if(i>0) {
                    move = {x: selectedMoveOption.moves[i].x - selectedMoveOption.moves[i-1].x, y: selectedMoveOption.moves[i].y - selectedMoveOption.moves[i-1].y};
                }

                this.lastMoveName = selectedMove.name;


                this.move(move.x, move.y);
                this.updateVision();
            }

            // TODO execute code here
            // then cancel moove
            this.deselectMoves();
            return true;
        } else {
            this.deselectMoves();
            const index = parseInt(symbol);

            this.moves[index].selected = true;
            console.log("move selected: " + this.moves[index].name);

             // drop out if move on cooldown
             if(this.moves[index].cooldown > 0) { 
                console.log("attempted move on CD. Resetting move selection.");
                this.deselectMoves();
                return false;
            }

            const moveResults = MoveManager.moveResults(this.level!, this.moves[index], this.level!.lastKeyStyle);   
            this.selectedMoveOptions = moveResults;
            
            return false;
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
        this.emit("act");

        // reduce cooldown for each of the moves
        this.moves.forEach(move => {
            if(move.cooldown > 0) {
                move.cooldown--;
            }
        });
    }

    interruptMoveChain() {
        this.deselectMoves();
        this.interruptMoves = true;
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        console.log("[PLAYER] took damage, health now " + this.health);
        
        if (this.health <= 0) {
            this.emit("death");
        } else {
            this.emit("damage");
        }

        this.interruptMoveChain();
    }

    // the way ROT.js wants to do vision is async. That makes me ... uncomfortable? But lets roll
    // with it and see if I can live with that oddness.
    updateVision(): void {
        if(!this.level) { return; }

        let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            return this.level!.map.pointTransparent(x, y);
        });

        // set all tiles to not visible
        this.level!.map.resetPlayerVisibility();

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
        this.selectedMoveOptions.forEach(option => {

            // TODO make last step brighter
            for (let step of option.moves) {
                const light: Light = {
                    p: {x: this.x + step.x, y: this.y + step.y},
                    distance: 1,
                    color: COLORS.MOVE_LIGHT_BLUE,
                    being: this
                };
                lights.push(light);
            }
        });
        return lights;
    }
}