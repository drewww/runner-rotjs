import * as ROT from "rot-js"; // Import the 'rot-js' module
import { StatusBar } from "../elements/status-bar";
import { IGame, GameState, LevelType, SCREEN_HEIGHT, SCREEN_WIDTH } from "../..";
import { Player } from "../../entities/player";
import { LevelController } from "../../level/level-controller";
import { Interactable } from "../../level/tile";
import { Screen } from "../screen";
import { MoveMenuScreen } from './move-menu-screen';
import { Overlays } from "../overlays";
import { TextBox } from "../elements/text-box";
import { COLORS } from "../../colors";
import { Hunter } from "../../entities/hunter";

const RIGHT_MENU_WIDTH: number = 20;

export class GameScreen extends Screen {
    public level: LevelController;

    private game: IGame;
    statusBar: StatusBar | undefined;
    player: Player | undefined;

    engine: ROT.Engine;
    moveMenu: any;

    overlays: Overlays;
    triggered: string[] = [];
    currentTriggerTextBox: TextBox | undefined;
    hunterDetect: any;

    constructor(game: IGame, levelType: LevelType) {
        super();

        // starter level. eventually this should be the "intro" level, but for now use the tutorial cave.
        this.game = game;

        // careful, the height here relates to the screen height.
        this.overlays = new Overlays(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        this.level = new LevelController(levelType, SCREEN_WIDTH - RIGHT_MENU_WIDTH - 2, SCREEN_HEIGHT - 2, 0, this.overlays);
        this.level.x = 1;
        this.level.y = 1;
        this.x = 0;
        this.y = 0;
        // this sets the render order, be careful.

        // this.overlays.fillLayerWithValue("red", "#aa0000FF");
        // this.overlays.addListener("draw", () => {
        //     this.game.refreshDisplay();
        // });

        this.elements!.push(this.level);
        // this.elements!.push(this.overlays);

        this.engine = new ROT.Engine(this.level.scheduler);
    }


    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);

         // absolutely heinous but 
         if (this.level.type !== LevelType.VAULT && !this.hunterDetect && this.level.getBeings().some((being) => being instanceof Hunter)) {
            const hunter = this.level.getBeings().find((being) => being instanceof Hunter) as Hunter;    
            hunter.resetMoveListeners();

            if(hunter && !hunter.active()) { return; }
            if(this.level.type===LevelType.TUTORIAL) { return; }

            this.hunterDetect = true;


            var text = `ALERT: %c{${COLORS.LASER_RED}}HUNTER ENTERING FLOOR`
            if(this.player!.depth===-1) {
                hunter.enableJuggernaut();
                text = `ALERT: %c{${COLORS.LASER_RED}}HUNTER ENTERING FLOOR [JUGGERNAUT MODE]`;

            } else {
                hunter.disableJuggernaut();
            }

            hunter.addMoveListener((hunter: Hunter) => {
                this.level.player!.updateVision();
                this.draw(display, xOffset, yOffset);
            });

            const textBox = new TextBox(this.player!.x, this.player!.y + 8, 30, 5, text , COLORS.WHITE, COLORS.DARK_GREY, true, 0, 20);
            this.elements.push(textBox);
            this.currentTriggerTextBox = textBox;

            setTimeout(() => {
                if (this.elements.includes(textBox)) {
                    this.elements.splice(this.elements.indexOf(textBox), 1);
                    this.currentTriggerTextBox = undefined;
                }
            }, 6000);
        }
    }

    handleEvent(e: KeyboardEvent): void {
        var releaseLockAfterHandling = true;

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


        // set lastKeyUse to "keypad" if the keycode is in one of the VK_NUMPAD* codes, but if it's letters
        // W,E,D,C,X,Z,A, or Q, set it to "letters".

        if (code >= ROT.KEYS.VK_A && code <= ROT.KEYS.VK_Z) {
            this.level.lastKeyStyle = "letters";
        } else if (code >= ROT.KEYS.VK_NUMPAD0 && code <= ROT.KEYS.VK_NUMPAD9) {
            this.level.lastKeyStyle = "keypad";
        }

        console.log("lastKeyStyle: " + this.level.lastKeyStyle);

        // first, short circuit other detection. if we have a move selected, there are different options.
        if (this.player?.getSelectedMove()) {
            if (e.keyCode == ROT.KEYS.VK_NUMPAD5 || e.keyCode == ROT.KEYS.VK_S) {
                this.level.player!.deselectMoves();
                return;

            } else if (code >= ROT.KEYS.VK_1 && code <= ROT.KEYS.VK_9) {

                this.level.player!.deselectMoves();
                return;
            } else if (code in keyMap) {
                // call select move again, but we need to pass the string version of the key character.
                // this has gotten VERY stupid but we're going to see it through to finish up for the night.

                var didMove = false;
                if (this.level.lastKeyStyle === "letters") {
                    didMove = this.level.player!.selectMove(String.fromCharCode(code));
                } else if (this.level.lastKeyStyle === "keypad") {
                    didMove = this.level.player!.selectMove((code - ROT.KEYS.VK_NUMPAD0).toString());
                }

                releaseLockAfterHandling = didMove;

                // gross repetition here. should refactor this whole block eventually.
                if (this.engine && releaseLockAfterHandling) {
                    console.log("releasing lock");
                    this.engine.unlock();
                }

                return;
            }
        }


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
                    // console.log("adjacent tile: " + JSON.stringify(adjacentTile));
                    // console.log("interactable: " + ('interact' in adjacentTile));
                    if (adjacentTile && 'interact' in adjacentTile) {
                        (<Interactable>adjacentTile).interact(this.level.player!);
                    }
                }
            }

            // do this so pauses advance the turn counter
            this.level.player!.move(0, 0);

        } else if (code >= ROT.KEYS.VK_1 && code <= ROT.KEYS.VK_9) {
            console.log("move key pressed");

            // TODO refactor this, it's a mess that we're passing in numbers as strings sometimes
            // and strings as strings others. Should be two methods, probably.
            // if this is the same as a move already selected, it will execute it.



            const didMove = this.level.player!.selectMove((code - ROT.KEYS.VK_1).toString());

            // if a move was executed, release the lock so it "counts" as a move and lets other
            // entities act. otherwise, hold the lock because it was just a UI manipulation.            
            releaseLockAfterHandling = didMove;

        } else if (code in keyMap) {

            var diff = ROT.DIRS[8][keyMap[code]];
            console.log(`[player @${this.level.player!.getPosition().x},${this.level.player!.getPosition().y}] move: ${diff[0]},${diff[1]}`);
            const didMove = this.level.player!.move(diff[0], diff[1]);
            
            if(!didMove) {releaseLockAfterHandling = false;}
            this.level.player!.deselectMoves();

        } else if (code == ROT.KEYS.VK_ESCAPE) {
            this.level.player!.deselectMoves();

            releaseLockAfterHandling = false;
        }

        // this is async so ... start it and see what happens
        this.level.player!.updateVision();

        // check if anything happens based on where the player moved
        // 1. in enemy vision? take damage
        // 2. on the exit? win

        //-------------------//
        const curTile = this.level.map.getTile(this.level.player!.x, this.level.player!.y);

        // stupid that this depends on a specific character
        if (curTile && curTile.symbol === '%' && curTile.enabled) {
            console.log("player on exit " + JSON.stringify(curTile));
            this.advanceDepth();
        }

        if (this.engine && releaseLockAfterHandling) {
            console.log("releasing lock");
            this.engine.unlock();
        } else {
            console.log("holding lock");
        }

        // moving refresh here seems to deal with the "first move" disappearing issue
        // seems okay to have this be our big refresh moment, but we'll see. the timing
        // issues on the FOV calculation still have me concerned and refreshing at the last moment
        // before acting seems nice. I'm also a little sure about whether this means
        // enemes will be shown in their "correct" place.
        this.game.refreshDisplay();
    }

    advanceDepth(): void {
        this.triggered = [];
        this.level.player!.depth++;
        console.log("ADVANCING TO DEPTH: " + this.level.player!.depth);
        if (this.level.player!.depth >= 0) {
            this.game.switchState(GameState.WINSCREEN);
        } else {
            this.level.disable();
            // prepare another level.
            var newLevel;
            if(this.level.player!.depth>=-3) {
                newLevel = new LevelController(LevelType.EDGE_ROOM, SCREEN_WIDTH - RIGHT_MENU_WIDTH - 2, SCREEN_HEIGHT - 2, this.level.player!.depth+3, this.overlays);
            } else {
                newLevel = new LevelController(LevelType.VAULT, SCREEN_WIDTH - RIGHT_MENU_WIDTH - 2, SCREEN_HEIGHT - 2, this.level.player!.depth+3, this.overlays);
            }

            newLevel.x = 1;
            newLevel.y = 1;

            this.elements = [];

            this.level = newLevel;

            // does this prepend? tbd.
            this.elements = [this.level, this.statusBar!, this.moveMenu!];

            // why do I keep rewriting this code -- abstract this at some point
            const tile = this.level.map.getAllTiles().find((tile) => {
                return tile.type === "ENTRANCE";
            });

            if (!tile) {
                console.error("No entrance tile found.");
            }
            this.player!.setPosition(tile!);
            this.player!.resetCooldowns();

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

        if (!this.statusBar) {
            this.statusBar = new StatusBar(this.width - RIGHT_MENU_WIDTH, this.height - 1, RIGHT_MENU_WIDTH, 1, player!);
            this.elements!.push(this.statusBar);
        } else {
            this.statusBar.player = player;
        }

        if (!this.moveMenu) {
            this.moveMenu = new MoveMenuScreen(0, 0, player);

            this.moveMenu.x = this.width - RIGHT_MENU_WIDTH;
            this.moveMenu.y = 0;
            this.moveMenu.width = RIGHT_MENU_WIDTH;
            this.moveMenu.height = this.height - 1;
            this.elements!.push(this.moveMenu);
        } else {
            this.moveMenu.setPlayer(player);
        }

        this.player.addListener("act", (player: Player) => {
            this.engine.lock();
        });

        this.player.addListener("death", (player: Player) => {
            this.game.switchState(GameState.KILLSCREEN);
        });

        this.player.addListener("move", (player: Player) => {
            // see if we need to trigger a notice
            const tile = this.level.map.getTile(this.player!.x, this.player!.y);
            if (tile.triggerMetadata) {
                const trigger: { trigger: string, text: string } = tile.triggerMetadata;

                if (!this.triggered.includes(trigger.trigger)) {
                    if (this.currentTriggerTextBox) {
                        this.elements.splice(this.elements.indexOf(this.currentTriggerTextBox), 1);
                    }

                    this.triggered.push(trigger.trigger);
                    // console.log("triggered: " + "(" + trigger.trigger + ") " + trigger.text);

                    const textBox = new TextBox(this.player!.x, this.player!.y + 8, 30, 5, trigger.text, COLORS.WHITE, COLORS.DARK_GREY, true, 0, 20);
                    this.elements.push(textBox);
                    this.currentTriggerTextBox = textBox;

                    setTimeout(() => {
                        if (this.elements.includes(textBox)) {
                            this.elements.splice(this.elements.indexOf(textBox), 1);
                            this.currentTriggerTextBox = undefined;
                        }
                    }, 10000);

                    // hack! but check and see if there's a stunned hunter and if the player has triggered A.
                    // if they have, activate it.
                    if(trigger.trigger==="A") {
                        this.level.activateHunter();
                    }

                    if(trigger.trigger==="B") {
                        // trigger the objective lines
                        this.level.showObjectivePathOverlays();
                    }
                }
            }
        });
    }
}