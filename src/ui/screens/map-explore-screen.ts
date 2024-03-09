import * as ROT from "rot-js"; // Import the 'rot-js' module
import { IGame, LevelType, SCREEN_HEIGHT, SCREEN_WIDTH } from "../..";
import { LevelController } from "../../level/level-controller";
import { Tile } from "../../level/tile";
import { Screen } from "../screen";
import { Overlays } from "../overlays";
import { EdgeRoomGameMap } from "../../level/edge-room-game-map";

export class MapExploreScreen extends Screen {

    private game: IGame;
    level: LevelController;
    levelType: LevelType;
    overlays: Overlays;

    constructor(game: IGame) {
        super();

        // starter level. eventually this should be the "intro" level, but for now use the tutorial cave.
        this.game = game;

        this.levelType = LevelType.EDGE_ROOM;
        this.overlays = new Overlays(0, 0, this.width, this.height);
        this.overlays.hide();
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

        this.overlays.clear();

        // careful, the height here relates to the screen height.
        // match the dimensions of the "normal" view which has the menu UI on the right
        const level = new LevelController(type, SCREEN_WIDTH - 20, SCREEN_HEIGHT);
        level.map.getAllTiles().forEach((tile: Tile) => {
            tile.discovered = true;
            tile.visible = true;
        });

        this.elements.push(level);

        // iterate through every tile in the map, and add a colored tile to the overlay based on the tile's ROOM_ID number if it has one.
        if(type===LevelType.EDGE_ROOM) {
            const edgeRoomLevel = <EdgeRoomGameMap>level.map;
            this.overlays.addLayer("rooms");
            const maxRoomId = edgeRoomLevel.totalRooms;

            let colors: string[] = [];
            for (let roomId = 0; roomId < maxRoomId; roomId++) {
                colors.push(ROT.Color.toHex([roomId*10, roomId*10, roomId*10]) + "EE");
            }

            level.map.getAllTiles().forEach((tile: Tile) => {
                // split the tile procgentype on underscores. if it splits successfully and the first part is ROOM, then parse the second
                // part to get a roomId.
                const parts = tile.procGenType.split('_');
                if (parts.length > 1 && parts[0] === 'ROOM') {
                    const roomId = parseInt(parts[1]);
                    this.overlays.setValueOnLayer("rooms", tile.x-1, tile.y-1, colors[roomId]);
                }
            });

            this.overlays.draw();
        }
        this.level = level;
        return level;
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
        this.overlays.show();
    }

    handleEvent(e: KeyboardEvent): void {
        // regenerate level on every key press
        this.level = this.generateLevelType(this.levelType);

        this.game.refreshDisplay();
    }

    public disable(): void {
        this.overlays.hide();

        this.overlays.disable();
    }
}