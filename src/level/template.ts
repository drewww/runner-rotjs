import { Level } from "./level";
import { Tile } from "./tile";


export type MapTemplate = {
    name: string;
    template: string[];

    // there may be other constraints we add here
}

export const EXIT: MapTemplate = {
    name: "EXIT",
    template: [
        "   ",
        " % ",
        " # ",
        " # ",
        " # "
    ]
}

export const ENTRANCE: MapTemplate = {
    name: "ENTRANCE",
    template: [
        "   ",
        " @ ",
        " # ",
        " % ",
        "   "
    ]
}

export class Template {
    static addTemplate(level: Level, template: MapTemplate, minDistance: number = 0, hallway: boolean=false): void {
        // look for places to put the template

        const templateSize = Template.getTemplateDimensions(template);

        // distance will let you know how far in A* distance it can be from the player starting. 
        // for now ignore it.

        // pick random spots, see if there is space. 
        const freeCells = level.getEmptyPoints().filter(point => { 
            const tile = level.map.getTile(point.x, point.y)
            return tile.procGenType != "HALLWAY"
        });
    
        let placed = false;
        while (!placed) {
            const randomIndex = Math.floor(Math.random() * freeCells.length);

            if(this.templateFitsAtPoint(level, template, freeCells[randomIndex])) {
                this.placeTemplateAtPoint(level, template, freeCells[randomIndex]);
                placed = true;
            }
        }
    }

    static placeTemplateAtPoint(level: Level, template: MapTemplate, point: {x: number, y: number}): void {
        const dimensions = Template.getTemplateDimensions(template);

        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const levelTile = level.map.getTile(point.x + x, point.y + y);
                const templateTile = template.template[y][x];

                var newTile;

                switch (templateTile) {
                    case " ":
                        newTile = new Tile(point.x + x, point.y + y, "FLOOR");
                        break;
                    case "#":
                        newTile = new Tile(point.x + x, point.y + y, "FORCEFIELD");
                        break;
                    case "%":
                        newTile = new Tile(point.x + x, point.y + y, "EXIT");
                        break;
                    case "@":
                        // skip this?? 
                        break;
                    default:
                        console.error("unrecognized template tile: " + templateTile);
                        break;
                }

                if (newTile) {
                    level.map.setTile(newTile);
                }
            }
        }
    }

    static templateFitsAtPoint(level: Level, template: MapTemplate, point: {x: number, y: number}, rotation: number = 0): boolean {
        const dimensions = Template.getTemplateDimensions(template);
        
        // check if the template fits at the point
        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const levelTile = level.map.getTile(point.x + x, point.y + y);

                // make sure none of the space the template might take up is solid. 
                // non solid stuff we can overwrite(?)
                if (levelTile.solid) {
                    break;
                }
            }
        }

        return false;
    }

    static getTemplateDimensions(template: MapTemplate): {w: number, h:number} {
        return {w: template.template[0].length, h: template.template.length};
    }
}