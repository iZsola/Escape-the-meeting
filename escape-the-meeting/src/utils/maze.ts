import { GRID_SIZE, TILE_WALL, TILE_EMPTY, TILE_START, TILE_EXIT, TILE_COFFEE } from '../constants';
import { MANAGERS } from '../data/managers';

export const generateMaze = () => {
    let newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(TILE_WALL));
    
    const directions = [
        { x: 0, y: -2 }, { x: 0, y: 2 }, { x: 2, y: 0 }, { x: -2, y: 0 }
    ];

    const carve = (cx: number, cy: number) => {
        newGrid[cy][cx] = TILE_EMPTY;
        const dirs = directions.sort(() => Math.random() - 0.5);

        for (const dir of dirs) {
            const nx = cx + dir.x;
            const ny = cy + dir.y;

            if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1 && newGrid[ny][nx] === TILE_WALL) {
                newGrid[cy + dir.y / 2][cx + dir.x / 2] = TILE_EMPTY;
                carve(nx, ny);
            }
        }
    };

    carve(1, 1);

    for (let i = 0; i < GRID_SIZE * 1.5; i++) {
        const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        if (newGrid[ry][rx] === TILE_WALL) {
             if (rx > 0 && rx < GRID_SIZE - 1 && ry > 0 && ry < GRID_SIZE - 1) {
                 newGrid[ry][rx] = TILE_EMPTY;
             }
        }
    }

    return newGrid;
};

export const initializeLevel = (lvlNum: number) => {
    let newGrid, exitX, exitY, startX, startY;
    let solvable = false;
    while (!solvable) {
        newGrid = generateMaze();
        startX = 1; startY = 1;
        newGrid[startY][startX] = TILE_START;

        exitX = GRID_SIZE - 2;
        exitY = GRID_SIZE - 2;
        while(newGrid[exitY][exitX] === TILE_WALL) {
            exitX--;
            if(exitX < 1) { exitX = GRID_SIZE - 2; exitY--; }
        }
        newGrid[exitY][exitX] = TILE_EXIT;

        const visited = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
        const queue = [{x: startX, y: startY}];
        visited[startY][startX] = true;
        
        while (queue.length > 0) {
            const curr = queue.shift()!;
            if (curr.x === exitX && curr.y === exitY) {
                solvable = true;
                break;
            }
            const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
            for (const d of dirs) {
                const nx = curr.x + d.x;
                const ny = curr.y + d.y;
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !visited[ny][nx] && newGrid[ny][nx] !== TILE_WALL) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }

    if (!newGrid) return null;

    let newEnemies = [];
    
    // Analyze path to ensure at least one enemy blocks the main route
    // Re-run BFS to get the path
    let path: {x: number, y: number}[] = [];
    const q = [{x: startX, y: startY, p: [] as {x:number, y:number}[]}];
    const v = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
    v[startY][startX] = true;
    
    while (q.length > 0) {
        const curr = q.shift()!;
        if (curr.x === exitX && curr.y === exitY) {
            path = curr.p;
            break;
        }
        const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
        for (const d of dirs) {
            const nx = curr.x + d.x;
            const ny = curr.y + d.y;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !v[ny][nx] && newGrid[ny][nx] !== TILE_WALL) {
                v[ny][nx] = true;
                q.push({x: nx, y: ny, p: [...curr.p, {x: nx, y: ny}]});
            }
        }
    }

    const enemyCount = 2 + Math.floor(lvlNum / 1.5); 
    
    // Force 1 enemy on the solution path (if path exists and is long enough)
    if (path.length > 2) {
         const pathIndex = Math.floor(path.length / 2); // Place in middle of path
         const pos = path[pathIndex];
         const manager = MANAGERS[Math.floor(Math.random() * MANAGERS.length)];
         newEnemies.push({
             id: 0,
             x: pos.x,
             y: pos.y,
             name: manager.name,
             lines: manager.lines
         });
    }

    // Place remaining enemies randomly
    for (let i = newEnemies.length; i < enemyCount; i++) {
      let ex, ey;
      let attempts = 0;
      do {
        ex = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        ey = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        attempts++;
      } while ((newGrid[ey][ex] !== TILE_EMPTY || (ex === 1 && ey === 1) || (ex === exitX && ey === exitY) || newEnemies.some(e => e.x === ex && e.y === ey)) && attempts < 100);
      
      if (attempts < 100) {
          const manager = MANAGERS[Math.floor(Math.random() * MANAGERS.length)];
          newEnemies.push({
            id: i,
            x: ex,
            y: ey,
            name: manager.name,
            lines: manager.lines
          });
      }
    }

    for (let i = 0; i < 3; i++) {
       let cx, cy;
       do {
           cx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
           cy = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
       } while (newGrid[cy][cx] !== TILE_EMPTY);
       newGrid[cy][cx] = TILE_COFFEE;
    }
    
    // Determine time limit based on level
    const timeLimit = 20;

    return {
        grid: newGrid,
        enemies: newEnemies,
        playerStart: { x: 1, y: 1 },
        timeLimit
    };
};

