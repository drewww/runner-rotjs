import { COLORS } from "../colors"


export const TILE_TYPES = {
    "FLOOR": {symbol: ".", fg: COLORS.WHITE, bg: COLORS.BLACK, opaque: false, solid: false},
    "WALL": {symbol: " ", fg: COLORS.BLACK, bg: COLORS.BLACK, opaque: true, solid: true},
    "EXIT": {symbol: ">", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: false},
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