let canvas = <HTMLCanvasElement>document.getElementById('myCanvas'),
    context = canvas.getContext("2d");
const TILE_SIZE = 64;

class Game {
    zombies: Array<Zombie>;
    player: Player;
    tileMap = new Map();
    walls: Array<Tile> = [];
    constructor() {
        this.generateBoundaries();
        this.player = new Player(5, 5);
        this.zombies = this.generateZombies(1);
        this.tileMap.set(this.player.tileCode, "player");
        this.zombies.forEach((zombie) => this.tileMap.set(zombie.tileCode, "zombie"));
        this.walls.forEach((wall) => this.tileMap.set(wall.tileCode, "wall"));
        let self = this;
        document.addEventListener("keydown", function(event) {
            self.control(event.key);
        });

    }
    generateBoundaries() {
        const MAP_WIDTH = 16,
            MAP_HEIGHT = 12,
            NUMBER_OF_WALLS = 4;
        this.generateWall(MAP_WIDTH, "right", -1);
        this.generateWall(MAP_WIDTH, "right", 12);
        this.generateWall(MAP_HEIGHT, "down", -1);
        this.generateWall(MAP_HEIGHT, "down", 16);
        this.generateWall(6, "right", 10, "images/wall.png");
        this.generateWall(6, "down", 10, "images/wall.png");
    }

    generateWall(wallLength: number, direction: string, startPoint: number, image = "", exitPoint = null) {
        //direction is either down or right
        //if image is left empty, generates and invisible tile.

        if (direction === "right") {
            for (let x = 0; x < wallLength; x++) {
                this.walls.push(new Tile(x, startPoint, image));
            }
        }
        if (direction === "down") {
            for (let i = 0; i < wallLength; i++) {
                this.walls.push(new Tile(startPoint, i, image));
            }
        }

    }

    generateZombies(howMany) {
        let result = [];
        for (let i = 0; i < howMany; i++) {
            result.push(new Zombie(i, 2));
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
            this.moveTile(this.player, direction);
            this.moveZombie(this.zombies[0]);
        }
    }

    moveZombie(zombie) {
        let distanceFromPlayer = [zombie.xPos - this.player.xPos,
            zombie.yPos - this.player.yPos]
        if (distanceFromPlayer[0] != 0) {
            if (distanceFromPlayer[0] < 0 && !this.checkForCollison("right", zombie)) {
                this.moveTile(zombie, "right");
            } else if (!this.checkForCollison("left", zombie)) {
                this.moveTile(zombie, "left");
            }
        } else {
            if (distanceFromPlayer[1] < 0 && !this.checkForCollison("down", zombie)) {
                this.moveTile(zombie, "down");
            } else if (!this.checkForCollison("up", zombie)) {
                this.moveTile(zombie, "up");
            }
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
        super(initalxPos, initalyPos, imagePath)
    }
}

class Zombie extends Tile {
    type = "zombie";
    constructor(initalxPos, initalyPos, imagePath = "images/zombie.png") {
        super(initalxPos, initalyPos, imagePath)
    }

}

let game = new Game();
