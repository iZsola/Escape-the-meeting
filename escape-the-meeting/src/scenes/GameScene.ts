import Phaser from 'phaser';
import { MazeGenerator, TILE_SIZE, WALL } from '../utils/MazeGenerator';
import type { NPCProfile } from '../data/Dialogues';
import { NPCS } from '../data/Dialogues';

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private npcGroup!: Phaser.Physics.Arcade.Group;
    private sanity: number = 100;
    private sanityText!: Phaser.GameObjects.Text;
    private activeNPCs: Map<Phaser.GameObjects.GameObject, NPCProfile> = new Map();
    
    constructor() {
        super('GameScene');
    }
    // ... (rest of the file)

    create() {
        // Generate Maze
        const width = 25; // Tiles
        const height = 19;
        const mazeGen = new MazeGenerator(width, height);
        const maze = mazeGen.generate();

        // Create Tilemap (using graphics for simplicity or sprite tiles)
        const walls = this.physics.add.staticGroup();
        
        // Floor (just visual, no physics needed)
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const tx = x * TILE_SIZE + TILE_SIZE / 2;
                const ty = y * TILE_SIZE + TILE_SIZE / 2;

                if (maze.grid[y][x] === WALL) {
                    walls.create(tx, ty, 'wall');
                } else {
                    this.add.image(tx, ty, 'floor');
                }
            }
        }

        // Place Exit
        const exitX = maze.exit.x * TILE_SIZE + TILE_SIZE / 2;
        const exitY = maze.exit.y * TILE_SIZE + TILE_SIZE / 2;
        const exit = this.physics.add.staticImage(exitX, exitY, 'exit');

        // Player
        const startX = maze.start.x * TILE_SIZE + TILE_SIZE / 2;
        const startY = maze.start.y * TILE_SIZE + TILE_SIZE / 2;
        this.player = this.physics.add.sprite(startX, startY, 'player');
        this.player.setCollideWorldBounds(true);

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, maze.width * TILE_SIZE, maze.height * TILE_SIZE);
        this.physics.world.setBounds(0, 0, maze.width * TILE_SIZE, maze.height * TILE_SIZE);

        // Collisions
        this.physics.add.collider(this.player, walls);
        
        // Win Condition
        this.physics.add.overlap(this.player, exit, () => {
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'ESCAPED!', {
                fontSize: '64px',
                color: '#00ff00',
                backgroundColor: '#000000'
            }).setOrigin(0.5).setScrollFactor(0);
            this.physics.pause();
        });

        // NPCs
        this.npcGroup = this.physics.add.group();
        
        // Spawn NPCs randomly
        for (let i = 0; i < 8; i++) {
            let mx, my;
            do {
                mx = Phaser.Math.Between(1, maze.width - 2);
                my = Phaser.Math.Between(1, maze.height - 2);
            } while (maze.grid[my][mx] === WALL || (mx === maze.start.x && my === maze.start.y));

            // Pick a random NPC profile
            const profile = NPCS[Math.floor(Math.random() * NPCS.length)];

            const sprite = this.npcGroup.create(
                mx * TILE_SIZE + TILE_SIZE / 2, 
                my * TILE_SIZE + TILE_SIZE / 2, 
                'npc'
            ) as Phaser.Physics.Arcade.Sprite;
            
            sprite.setTint(profile.color);
            sprite.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30));
            sprite.setBounce(1);
            sprite.setCollideWorldBounds(true);

            this.activeNPCs.set(sprite, profile);
        }

        this.physics.add.collider(this.npcGroup, walls);
        this.physics.add.collider(this.npcGroup, this.npcGroup);

        // Encounter
        this.physics.add.overlap(this.player, this.npcGroup, (player, npc) => {
            const gameObject = npc as Phaser.GameObjects.GameObject;
            const profile = this.activeNPCs.get(gameObject);
            if (!profile) return;

            const pBody = (player as Phaser.Physics.Arcade.Sprite).body;
            const nBody = (npc as Phaser.Physics.Arcade.Sprite).body;
            
            if (pBody && nBody) {
                // Knockback
                const angle = Phaser.Math.Angle.Between(pBody.x, pBody.y, nBody.x, nBody.y);
                (player as Phaser.Physics.Arcade.Sprite).setVelocity(Math.cos(angle) * -200, Math.sin(angle) * -200);
                
                this.scene.pause();
                this.scene.launch('ConversationScene', { npc: profile });
            }
        });

        // HUD
        this.sanityText = this.add.text(10, 10, `Sanity: ${this.sanity}%`, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0);

        // Events from ConversationScene
        this.events.on('resume', (_scene: Phaser.Scene, data: any) => {
            if (data) {
                if (data.sanityCost) {
                    this.sanity -= data.sanityCost;
                    this.sanityText.setText(`Sanity: ${this.sanity}%`);
                    
                    if (this.sanity <= 0) {
                        this.gameOver();
                    }
                }
            }
        });

        // Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    gameOver() {
        this.physics.pause();
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'BURNOUT...', {
            fontSize: '64px',
            color: '#ff0000',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setScrollFactor(0);
    }

    update() {
        if (!this.cursors || this.sanity <= 0) return;
        
        const speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
}
