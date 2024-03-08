import * as ROT from "rot-js"; // Import the 'rot-js' module
import { IGame, LevelType, SCREEN_HEIGHT, SCREEN_WIDTH } from "../..";
import { LevelController } from "../../level/level-controller";
import { Tile } from "../../level/tile";
import { Screen } from "../screen";

export class MapExploreScreen extends Screen {

    private game: IGame;
    level: LevelController;
    levelType: LevelType;

    constructor(game: IGame) {
        super();

        // starter level. eventually this should be the "intro" level, but for now use the tutorial cave.
        this.game = game;

        this.levelType = LevelType.EDGE_ROOM;

        this.level = this.generateLevelType(this.levelType);
    }

    generateLevel(typeString: string) {
        const type = LevelType[typeString as keyof typeof LevelType];
        return this.generateLevelType(type);
    }

    generateLevelType(type: LevelType) {
        this.elements.forEach((element) => {
            element.disable();
        });
        this.elements = [];

        // careful, the height here relates to the screen height.
        // match the dimensions of the "normal" view which has the menu UI on the right
        const level = new LevelController(type, SCREEN_WIDTH - 20, SCREEN_HEIGHT);
        level.map.getAllTiles().forEach((tile: Tile) => {
            tile.discovered = true;
            tile.visible = true;
        });

        this.elements.push(level);

        this.level = level;
        return level;
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }

    handleEvent(e: KeyboardEvent): void {
        // regenerate level on every key press
        this.level = this.generateLevelType(this.levelType);

        this.game.refreshDisplay();
    }
}