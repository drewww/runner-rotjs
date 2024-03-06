import { COLORS } from "../colors";
import { Player } from "../entities/player";


export const TILE_TYPES = {
    "FLOOR": {symbol: ".", fg: COLORS.WHITE, bg: COLORS.BLACK, opaque: false, solid: false},
    "WALL": {symbol: " ", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true},
    "EXIT": {symbol: "%", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: false},
    "BUTTON": {symbol: "b", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true},
    "DOOR": {symbol: "-", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true},
    "FORCE_FIELD": {symbol: "#", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: true},
    "BOUNDARY": {symbol: "X", fg: COLORS.WHITE, bg: COLORS.WHITE, opaque: true, solid: true},
}

export interface Interactable {
    interact(player:Player): void;
}

export class Tile {
    public x:number;
    public y:number;

    public opaque:boolean;
    public solid:boolean;
    public symbol:string;
    public fg:string;
    public bg:string;

    public visible:boolean;
    public discovered:boolean;

    constructor(x:number, y:number, type:string) {
        this.x = x;
        this.y = y;

        this.visible = false;
        this.discovered = false;

        // assign defaults to calm the linter, then merge in defaults.
        this.opaque = false;
        this.solid = false;
        this.symbol = " ";
        this.fg = COLORS.WHITE;
        this.bg = COLORS.BLACK;

        const tileType = TILE_TYPES[type as keyof typeof TILE_TYPES];
        Object.assign(this, tileType);
    }
}