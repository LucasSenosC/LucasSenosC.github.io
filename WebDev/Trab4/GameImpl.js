import {cell} from "./Cell.js"
import {BasicIcon} from "./BasicIcon.js"

 // Concrete implementation of the IGame interface. This implementation
 // has the following behavior:
 // <ul>
 //   <li> Moves are allowed via the select() method for pairs of adjacent cells
 //        only.  The cells must have different types.  The move must create
 //        at least one run.
 //   <li> A run is defined to be three or more adjacent cells of the same
 //        type, horizontally or vertically. A given cell may be part
 //        of a horizontal run or a vertical run at the same time.
 //   <li> Points are awarded for runs based on their length.  A run of length
 //        3 is awarded BASE_SCORE points, and a run of length (3 + n) 
 //        points gets @f$BASE\_SCORE \times 2^n@f$.
 // </ul>
export class GameImpl{

    // Score awarded for a three-cell run.
    __BASE_SCORE = 10;

    // Turn debugging on or off.
    __DEBUG__ = false
    
    // Constructs a game with the given number of columns and rows
    // that will use the given <code>IGenerator</code> instance
    // to create new icons.
    //
    // @param width number of columns.
    // @param height number of rows.
    // @param generator generator for new icons.
    constructor(width, height, generator){
        // The grid of icons for this game.
        this.__grid = [];
        this.__width = width;
        this.__height = height;

        for(var x = 0; x < width; x++){
            this.__grid[x] = [];
            for(var y = 0; y < width; y++){
                this.__grid[x][y] = null;
            }
        }

        // Icon generator.
        this.__generator = generator

        // Initialize the grid.
        generator.initialize(this.__grid, true)
        this.removeAllRuns()

        // Current score of the game.
        this.__score = 0
    }

    // Remove all runs from the grid.
    removeAllRuns(){

        do{
            var runs = this.findRuns(true);
            var cond = runs.length;

            for(var i=0; i<this.getWidth();i++){
                this.collapseColumn(i);
                this.fillColumn(i);
            } 

        }while(cond >0);
    
    }

    // Get the debugging state. 
    debug (){
        return GameImpl.__DEBUG__;
    }

    // Set the debugging state.
    debug (deb){
        GameImpl.__DEBUG__ = deb;
    }

    // Returns the Icon at the given location in the game grid. 
    //
    // @param row row in the grid.
    // @param col column in the grid.
    // @return Icon at the given row and column
    getIcon(row, col){
        return this.__grid[row][col];
    }

    // Sets the Icon at the given location in the game grid. 
    //
    // @param row row in the grid.
    // @param col column in the grid.
    // @param icon to be set in (row,col).
    setIcon(row, col, icon){
        return this.__grid[row][col] = icon;
    }

    // Returns the number of columns in the game grid. 
    //
    // @return the width of the grid.
    getWidth(){
      return this.__width;
    }

    // Returns the number of rows in the game grid. 
    // the height of the grid.
    //
    // @return the height of the grid.
    getHeight(){
        return this.__height;
    }

    // Returns the current score. 
    //
    // @return current score for the game.
    getScore(){
        return this.__score;
    }

    // Swap the icons contained in two cells.
    //
    //  @param cells array with two cells.
    //  @see swapIcons (i, j, k, l)
    swapCells(cells){ 
        var cellA = cells[0];
        var cellB = cells[1];
        this.swapIcons(cellA.row(), cellA.col(),cellB.row(), cellB.col());
    }

    // Swap the positions of two icons.
    //
    //  @param (i,j) first icon.
    //  @param (k,l) second icon.
    swapIcons (i, j, k, l){
        var aux = this.getIcon(i,j);
        this.setIcon(i,j,this.getIcon(k,l));
        this.setIcon(k,l,aux);
    }
  
    //
    // In this implementation, the only possible move is a swap
    // of two adjacent cells.  In order for move to be made, the 
    // following must be True.
    // <ul>
    //   <li>The given array has length 2
    //   <li>The two given cell positions must be adjacent
    //   <li>The two given cell positions must have different icon types
    //   <li>Swapping the two icons must result in at least one run.
    // </ul>
    // If the conditions above are satisfied, the icons for the two
    // positions are exchanged and the method returns True otherwise,
    // the method returns False.  No other aspects of the game state 
    // are modified.
    //
    // @param cells cells to select.
    // @return True if the selected cells were modified, False otherwise.
    select(cells){
        
        this.swapCells(cells); // change the location of the given cells
        
        if(cells.length != 2){ // check if are two cells in "cells"
            this.swapCells(cells);
            return false;
        }

        var cellA = cells[0];
        var cellB = cells[1];

        if(cellA.getIcon().__eq__(cellB.getIcon())){ // verify if they are equal
            this.swapCells(cells);
            return false;
        }
        if(!cellA.isAdjacent(cellB)){ // verify if they are adjacent
            this.swapCells(cells);
            return false;
        }
        if(this.findRuns(false).length == 0){ // verify if swapping them we gonna create any run in grid
            this.swapCells(cells);
            return false;
        }

        // return true if pass in all tests and return true
        return true
        
    }
  
    // Returns a list of all cells forming part of a vertical or horizontal run. 
    // The list is in no particular order and may contain duplicates. 
    // If the argument is False, no modification is made to the game state; 
    // if the argument is True, grid locations for all cells in the list are 
    // nulled, and the score is updated.
    //
    // @param doMarkAndUpdateScore if False, game state is not modified.
    // @return list of all cells forming runs, in the form: 
    // @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    findRuns(doMarkAndUpdateScore){
        // variable that store the cells thar was in a run
        var c = [];

        //variable that store the points given with this runs
        var points = 0;

        // for each position in grid
        for(var row = 0; row<this.getHeight(); row++){
            for(var col = 0; col<this.getWidth(); col++){

                if(row<this.getWidth()-2){ //if que testa se estiver a pelo menos 2 de distancia da borda
                    var prev = true

                    if(row != 0){
                        if(this.getIcon(row,col).__eq__(this.getIcon(row-1,col))){
                            prev = false;
                        }
                    }

                    // check if the current icon is equal to icons in the next to rows
                    if(this.getIcon(row,col).__eq__(this.getIcon(row+1,col)) && this.getIcon(row,col).__eq__(this.getIcon(row+2,col)) && prev ){
                        
                        //qnt store the number of elements in the row
                        var qnt = 3;

                        // append the cells in the run 
                        c.push(new cell(row, col,this.getIcon(row,col)));
                        c.push(new cell(row+1, col,this.getIcon(row+1,col)));
                        c.push(new cell(row+2, col,this.getIcon(row+2,col)));

                        // look if the run is bigger than 3 icons, so look for the next rows
                        var i = row + 3;
                        while(i<this.getHeight()){
                            if(this.getIcon(row,col).__eq__(this.getIcon(i,col))){
                                qnt +=1;
                                c.push(new cell(i, col,this.getIcon(i,col)));
                                i +=1;
                            }else{
                                break;
                            }
                        }

                        // sum to "points", the points relative to this run
                        points += 10*Math.pow(2,qnt-3);
                    }
 
                }

                if(col<this.getWidth()-2){
                    var prev = true

                    if(col != 0){
                        if(this.getIcon(row,col).__eq__(this.getIcon(row,col-1))){
                            prev = false;
                        }
                    }

                    // check if the current icon is equal to icons in the next to columns
                    if(this.getIcon(row,col).__eq__(this.getIcon(row,col+1)) && this.getIcon(row,col).__eq__(this.getIcon(row,col+2)) && prev){
                        
                        //qnt store the number of elements in the row
                        var qnt = 3;
                        
                        // append the cells in the run 
                        c.push(new cell(row, col,this.getIcon(row, col)));
                        c.push(new cell(row, col+1,this.getIcon(row, col+1)));
                        c.push(new cell(row, col+2,this.getIcon(row, col+2)));

                        // look if the run is bigger than 3 icons, so look for next columns
                        var j = row + 3;
                        while(j<this.getHeight()){
                            if(this.getIcon(row,col).__eq__(this.getIcon(row, j))){
                                qnt +=1;
                                c.push(new cell(row, j,this.getIcon(row, j)));
                                j +=1;
                            }else{
                                break;
                            }
                        }
                        
                        // sum to "points", the points relative to this run
                        points += 10*Math.pow(2,qnt-3);
                    }

                }
            }
        }
        
        // if "doMarkAndUpdateScore" is true we gonna set cells in "c" to null and increase the score
        if(doMarkAndUpdateScore){
            // set the cells in "c" to null
            for(var i=0; i<c.length;i++){
                //
                this.setIcon(c[i].row(), c[i].col(), null);
            }
            this.__score += points;
        }

        
        return c;
    }
  
   // Removes an element at index pos, in a given column col, from the grid. 
   // All elements above the given position are shifted down, and the first 
   // cell of the column is set to null. 
   //
   // @param pos the position at which the element should be removed.
   // @param col column of pos. 
    removeAndShiftUp(pos, col){

        //  for each row that was above the given position
        for(var i = pos - 1; i >= 0; i--){
            this.swapIcons(i,col,i+1,col); //change the given cell with the cell under it one
        }
        this.setIcon(0,col,null);
    }
  
    //  Collapses the icons in the given column of the current game grid 
    //  such that all null positions, if any, are at the top of the column 
    //  and non-null icons are moved toward the bottom (i.e., as if by gravity). 
    //  The returned list contains Cells representing icons that were moved 
    //  (if any) in their new locations. Moreover, each Cell's previousRow property
    //  returns the original location of the icon. The list is in no particular order.
    //
    //  @param col column to be collapsed.
    //  @return list of cells for moved icons, in the form:
    //  @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    collapseColumn(col){
        // variable that contains all the changed cells 
        var c = []
        
        // get the last index of column
        var i=this.getHeight()-1;

        // variable that count how many cells was removed to shift down the above ones
        var j = 0
        
        // check i>=j cause for each time that finds a null cell, the top one is null, so isnt required to check it again
        while(i>=j){
            // if the cell isnt null
            if(this.getIcon(i,col) != null){
                if(j!=0){
                    //create a changed cell, that was moved "j" rows
                    var a = new cell(i, col, this.getIcon(i,col))
                    a.previousRow(i-j)
                    c.push(a);
                }        
                
                // move up in column and continue
                i-=1;
            }else{

                // calls "removeandshiftup"  
                this.removeAndShiftUp(i,col)
            
                // increase j if the cell was null
                j+=1;
            }
        }
        
        return c
    }
    
    // Fills the null locations (if any) at the top of the given column in the current game grid. 
    // The returned list contains Cells representing new icons added to this column in their new locations. 
    // The list is in no particular order.
    // 
    // @param col column to be filled.
    // @return list of new cells for icons added to the column, in the form:
    // @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    fillColumn(col){
        // variable that contains all changed cells
        var c = [];

        var i = 0;
        while(this.getIcon(i,col) == null){
            var icon = this.__generator.generate();
            this.setIcon(i,col, icon);
            c.push(new cell(i,col, icon));
            i++;
        }
        
        return c
    }

   // Returns a String representation of the grid for this game,
   // with rows delimited by newlines.
    __str__(){
        sb = "";
        for(row = 0; row<this.getHeight; row++){
            for(col = 0; col<this.getWidth; col++){
                icon = this.getIcon(row,col)
                if(icon == null){
                    sb+= "   *";
                }
                sb += "   " + str(icon);
            }
             sb += "\n";
        }
        return sb;
    }

    // Return a string representation of the grid, with 8 symbols:
    // - 01234567
    // - '!@+*$%//.'
    __repr__(){
        sb = " ".join(list(map(str,range(this.getWidth()))))+"\n\n";
        for(row = 0; row<this.getHeight; row++){
            for(col = 0; col<this.getWidth; col++){
                sb += "!@+*$%//."[this.getIcon(row,col).getType()%8] + " "
            }
            sb += "  " + str(row) + "\n";
        }
      return sb;
    }

    // Returns a String representation of a List of cells.
    //
    // @param lcells given list.
    // @return string with cells.
    toString(lcells){
        s = "";
        for(c=0; c< lcells.length ;c++){
            s += str(c) + " ";
        }
 
        if(lcells.length == 0){
            s += "\n";
        }
        return s
    }
}