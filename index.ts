let canvas = <HTMLCanvasElement>document.getElementById('myCanvas'),
    context = canvas.getContext("2d");
const TILE_SIZE = 64,
      MAP_HEIGHT = 12,
      MAP_WIDTH = 16;

class Game {
    zombies: Array<Zombie>;
    player: Player;
    tileMap = new Map();
    walls: Array<Tile> = [];
    exitTile: Tile;
    gameIsRunning: boolean;
    constructor() {
        this.clearGamespace();
        this.gameIsRunning = true;
        this.generateBoundaries();
        this.generateExitTile();
        this.player = new Player(7, 5);
        this.zombies = this.generateZombies(2);
        this.tileMap.set(this.player.tileCode, "player");
        this.zombies.forEach((zombie) => this.tileMap.set(zombie.tileCode, "zombie"));
        this.walls.forEach((wall) => this.tileMap.set(wall.tileCode, "wall"));
        let self = this;
        document.addEventListener("keydown", function(event) {
            self.control(event.key);
        });

    }


    clearGamespace(){
      context.clearRect(0,0,TILE_SIZE*MAP_WIDTH,TILE_SIZE*MAP_HEIGHT);
    }
    generateExitTile(){
      let exit = Math.floor(Math.random() * 4),
          exitLocations = [[0,0],[0,11],[15,0],[15,11]];
          this.exitTile = new Tile(exitLocations[exit][0],exitLocations[exit][1],"images/exit.png")
    }
    generateBoundaries() {
        const MAP_WIDTH = 16,
            MAP_HEIGHT = 12,
            NUMBER_OF_WALLS = 4;
        this.generateWall(MAP_WIDTH, "right", 0,-1,);
        this.generateWall(MAP_WIDTH, "right", 0,12,);
        this.generateWall(MAP_HEIGHT, "down", -1,0,);
        this.generateWall(MAP_HEIGHT, "down", 16,0,);
        this.generateWall(5, "right", 1,1, "images/wall.png");
        this.generateWall(5, "down", 3,3, "images/wall.png");
        this.generateWall(5, "right", 6,9, "images/wall.png");
    }

    generateWall(wallLength: number, direction: string,startX: number, startY: number, image = "", exitPoint = null) {
        //direction is either down or right
        //if image is left empty, generates and invisible tile.

        if (direction === "right") {
            for (let x = 0; x < wallLength; x++) {
                this.walls.push(new Tile(x+startX, startY, image));
            }
        }
        if (direction === "down") {
            for (let i = 0; i < wallLength; i++) {
                this.walls.push(new Tile(startX, i+startY, image));
            }
        }

    }
    generateMaze(){
      let randomNumber = (min,max) => {
        return Math.floor(Math.random() * (max - min + 1) + min )};

    }
    generateZombies(howMany) {
        let result = [];
        for (let i = 0; i < howMany; i++) {
            result.push(new Zombie(i, 3));
        }
        return result;
    }
    checkForCollison(direction: string, tile: Tile) {
        let offsetX = 0,
            offsetY = 0;
        switch (direction) {
            case "up":
                offsetY++;
                break;
            case "down":
                offsetY--;
                break;
            case "left":
                offsetX++;
                break;
            case "right":
                offsetX--;
                break;
        }
        return (this.tileMap.get(tile.generateTileCode(offsetX, offsetY)));

    }
    moveTile(tile: Tile, direction: string) {
        this.tileMap.delete(tile.tileCode);
        tile.clearTile();
        switch (direction) {
            case "up":
                tile.yPos -= 1;
                break;
            case "down":
                tile.yPos += 1;
                break;
            case "left":
                tile.xPos -= 1;
                break;
            case "right":
                tile.xPos += 1;
                break;
        }
        tile.renderTile();
        tile.tileCode = tile.generateTileCode();
        this.tileMap.set(tile.tileCode, tile.type);




    }

    control(key) {
        let direction = '';
        if(this.gameIsRunning){
          switch (key) {
              case "w":
                  direction = "up";
                  break;
              case "a":
                  direction = "left";
                  break;
              case "s":
                  direction = "down";
                  break;
              case "d":
                  direction = "right";
                  break;
          }
          if (this.checkForCollison(direction, this.player)) {
              console.log("collison");
          } else {
              this.moveAllZombies();
              this.moveTile(this.player, direction);
              this.checkGameState();
          }
        }

    }

    determineZombieMovePriority(zombie) {
        let result: Array<string> = [];
        zombie.xDistanceToPlayer = this.player.xPos - zombie.xPos;
        zombie.yDistanceToPlayer = this.player.yPos - zombie.yPos;

        let deterimeXDirection = (inverse = false) => {
          if (zombie.xDistanceToPlayer > 0 && !inverse){
            return "right";
          }else{
            return "left";
          }
        }
        let deterimeYDirection = (inverse = false) => {
          if (zombie.yDistanceToPlayer > 0 && !inverse){
            return "down";
          }else{
            return "up";
          }
        }
        if (Math.abs(zombie.xDistanceToPlayer) >= Math.abs(zombie.yDistanceToPlayer)) {
            //wants to move horizontally
            result.push(deterimeXDirection()); //Farthest
            result.push(deterimeYDirection()); //Next best
            result.push(deterimeYDirection(true)); //next worst
            result.push(deterimeXDirection(true)); //last choice
        } else {
            //wants to move vertically
            result.push(deterimeYDirection());
            result.push(deterimeXDirection());
            result.push(deterimeXDirection(true));
            result.push(deterimeYDirection(true));


        }
        return result;
    }

    moveAllZombies(){
      this.zombies.forEach((zombie) => this.moveZombie(zombie));
    }
    moveZombie(zombie){
    let directions = this.determineZombieMovePriority(zombie);
    for (let i = 0, x = directions.length; i < x; i++){
      if (!this.checkForCollison(directions[i],zombie)){
        this.moveTile(zombie,directions[i]);
        break;
      }
    }
    }
    checkGameState(){
      if (this.zombies.some((zombie)=> zombie.tileCode === this.player.tileCode)){
        this.clearGamespace();
        alert("You Lose!");
        this.gameIsRunning = false;
      }
      if (this.player.tileCode === this.exitTile.tileCode){
        this.clearGamespace();
        alert("You Win!");
        this.gameIsRunning = false;
      }
    }
}



class Tile {
    xPos: number;
    yPos: number;
    imagePath: string;
    tileCode: number;
    type = "tile";
    image;
    constructor(initalxPos, initalyPos, imagePath) {
        this.xPos = initalxPos;
        this.yPos = initalyPos;
        this.imagePath = imagePath;
        this.tileCode = this.generateTileCode();
        this.image = new Image();
        this.image.src = imagePath;
        this.image.addEventListener('load', () => {
            this.renderTile();
        });
    }
    clearTile() {
        context.clearRect(this.xPos * TILE_SIZE, this.yPos * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    renderTile() {
        context.drawImage(this.image, this.xPos * TILE_SIZE, this.yPos * TILE_SIZE);
    }
    generateTileCode(offsetX = 0, offsetY = 0) {
        return (this.xPos - offsetX) * 100 + (this.yPos - offsetY);
    }
}

class Player extends Tile {
    type = "player";
    constructor(initalxPos, initalyPos, imagePath = "images/player.png") {
        super(initalxPos, initalyPos, imagePath);
    }
}

class Zombie extends Tile {
    type = "zombie";
    xDistanceToPlayer: number;
    yDistanceToPlayer: number;
    constructor(initalxPos, initalyPos, imagePath = "images/zombie.png") {
        super(initalxPos, initalyPos, imagePath);
    }

}

let game = new Game();

let gameCheck = setInterval(()=>{
  if (!game.gameIsRunning){
    if (prompt("Would you like to play again? y/n").toLowerCase() == "y"){
      game = new Game();
    }else{
      clearInterval(gameCheck)
    }
  }
}, 500);
