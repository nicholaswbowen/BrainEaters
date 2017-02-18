let canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
let context = canvas.getContext("2d");
const TILE_SIZE = 64,
      tileLetters = ["A", "B", "C", "D", "E", "F", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

class Game {
    zombies: Array<Zombie>;
    player: Player;
    tileMap = new Map();
    constructor() {
        this.player = new Player(0, 4, "images/player.png");
        this.zombies = this.generateZombies(4);
        this.tileMap.set(this.player.tileCode,"player");

        let self = this;
        document.addEventListener("keydown", function(event) {
            self.control(event.key);
        });

    }

    generateZombies(howMany) {
        let result = [];
        for (let i = 0; i < howMany; i++) {
            result.push(new Zombie(i, 0, "images/zombie.png"))
        }
        return result;
    }

    moveTile(tile: Tile, direction: string) {
        this.tileMap.set(tile.tileCode,"empty");
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
        tile.setTileCode();
        this.tileMap.set(tile.tileCode,tile.type)
    }

    control(key) {
        switch (key) {
            case "w":
                this.moveTile(this.player, "up");
                break;
            case "a":
                this.moveTile(this.player, "left");
                break;
            case "s":
                this.moveTile(this.player, "down");
                break;
            case "d":
                this.moveTile(this.player, "right");
                break;
        }
    }

}






class Tile {
    xPos: number;
    yPos: number;
    imagePath: string;
    tileCode: string;
    type = "tile";
    image;
    constructor(initalxPos, initalyPos, imagePath) {
        this.xPos = initalxPos;
        this.yPos = initalyPos;
        this.imagePath = imagePath;
        this.setTileCode();
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
    setTileCode() {
        this.tileCode = `${tileLetters[this.xPos]}${this.yPos}`;
    }
}

class Player extends Tile {
  type = "player";

}

class Zombie extends Tile {
    type = "zombie";
}

let game = new Game();
