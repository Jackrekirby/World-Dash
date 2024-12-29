# Isometric

A simple isometric renderer for the web. Hopefully it becomes a fully fledged game - World Dash.

## Acknoledgements

Isometric Assets (Modified)
[https://gvituri.itch.io/isometric-trpg](https://gvituri.itch.io/isometric-trpg)

[https://xilurus.itch.io/pixel-isometric-village/devlog/727373/pixel-isometric-village-release](https://xilurus.itch.io/pixel-isometric-village/devlog/727373/pixel-isometric-village-release)

## Task List

## Bugs

1. Cursor shifted (since dynamic canvas size)

### Isometric Functionality

1. Player movement with arrow keys
2. Player collision
3. Correct render order of blocks, vegetation and players
4. Map creation tool
5. Animated water
6. More vegetation
7. Directional Light
8. Point Lights
9. Seasons
10. Weather
11. Screen shake on move / damage
12. Retro music
13. Tile transparency when player behind tile
14. Do not render blocks surrounded by opaque tiles
15. Clip tiles outside world
16. Camera
17. Randomised tile texture
18. Connected textures
19. Animated textures
20. Tile metadata (grouped tiles, collision data, lighting normals, can walk through, is solid block)
21. Procedural textures (e.g., for smoothing between tile types / rough edges)
22. Flipped / rotated textures for increased variation

### World Dash

1. Limit controls to move forward, rotate left, rotate right, jump, use item, use weapon, block weapon
2. Move slow in water
3. Water currents move player
4. Fall down holes and go back / alternative way
5. Dodge enemies and projectiles
6. Grab food (health)
7. Grab bonuses (speed)
8. Glide / flight / teleport / cannon / fan / jump pad
9. Drop things to trap other players / enemies
10. Ice is slippery (time to accelerate and decelerate)
11. Long wheat makes it difficult to see where you are
12. Move boxes out of the way
13. Lava stones that damange if you are on them for too long
14. Lily pads that drop you into water if you are on them for too long
15. Chop tree with multiple clicks (move forward)
16. Cactus you can break but damages you
17. Activation blocks to open doors (or drop box into hole to walk across)
18. Weapons that damage you (slow or back to check point)
19. Weapons that knock you back
20. Vehiles / rideable animals
21. Outrun style biome selection for difficulty

## Textures

1. Floor split into randomised versions of a block (also left and right walls)
2. Floor must be multi-layered, floor and height pixels
3. Add connected textures between floors and walls
4. Switch to 16x16 textures (16x17 causes issues). Create seperate grass decoration
5. Water pixels moving in tile across tiles (procedural water particles)
6. Need tool for rendering tiles to view repeated textures 

## Rendering Process

1. Generates WorldTile[] with a position and TileType
2. Generatye RenderTile[] which converts a TileType to a tileset name and index, given the time and world position for animated textures and spatially randomised textures.
3. RenderTile[] are sorted from back to front and drawn to canvas

Issues
1. Tiletypes are static, I want to generate a huge number of variants I do not want to name individually
2. Cannot easily customise the tile rendered, everything centrally controlled.