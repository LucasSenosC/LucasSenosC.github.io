import {cell} from "./Cell.js";
import {BasicIcon} from "./BasicIcon.js";

export class BasicGenerator{

    constructor(numtypes, seed = null){
        this.__numtypes = numtypes;
    }

    // função que retorna um icone aleatório
    generate(){
        return new BasicIcon(Math.floor(Math.random() * this.__numtypes));
    }

    // função que recebe uma grid e altera todos os valores para icons aleatórios
    initialize(grid, bool){
        var width = grid[0].length;
        var height = grid.length; 
        for(var x = 0; x < width; x++){
            for(var y = 0; y < height; y++){
                var icon = this.generate();
                grid[x][y] = icon;
            }
        }
    } 
}