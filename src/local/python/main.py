import os
import re
from pathlib import Path

import v1.utils as utils
from PIL import Image
from v1.structs import TileMetaIn, Tileset
from v1.watch import watch_directory


def get_img(name: str) -> Image.Image:
    img_path: str = f"assets/tiles/{name}.png"
    image = Image.open(img_path)
    return image


# X ignore
# X gen_rotated_variants
# X animated
# X color_replace [take first color from each row as the color to replace]
# - gen_edge_variants
# - recolor? (orchid)
# X add cursor and player
tilesize = 16

def gen_animated_variants(meta: TileMetaIn, image_variants: dict[str, Image.Image]):
    if not meta.animated:
        return 
    
    new_total_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants = utils.split_image(image, width=tilesize, height=tilesize)
        for i, new_image_variant in enumerate(new_image_variants.values()):
            print(f' - var - {name}:frame-{i}')
            new_total_image_variants[f'{name}:frame-{i}'] = new_image_variant

    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del frame - {k}')
        del image_variants[k]

    image_variants.update(new_total_image_variants)

def split_variants_into_tiles(meta: TileMetaIn, image_variants: dict[str, Image.Image]):
    if not meta.is_multi_tile:
        return 
    
    new_total_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants = utils.split_image(image, width=tilesize, height=tilesize)
        for variant_name, new_image_variant in new_image_variants.items():
            print(f' - var - {name}:sub-{variant_name}')
            new_total_image_variants[f'{name}:sub-{variant_name}'] = new_image_variant

    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del sub - {k}')
        del image_variants[k]

    image_variants.update(new_total_image_variants)

def gen_color_variants(meta: TileMetaIn, image_variants: dict[str, Image.Image]):
    if meta.color_replace is None:
        return
    
    new_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants_list = utils.replace_color_with_variants(image, get_img(meta.color_replace))
        for i, new_image_variant in enumerate(new_image_variants_list):
            print(f' - var - {name}:color-{i}')
            new_image_variants[f'{name}:color-{i}'] = new_image_variant
    
    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del color - {k}')
        del image_variants[k]

    image_variants.update(new_image_variants)

def gen_rotated_variants(meta: TileMetaIn, image_variants: dict[str, Image.Image]):
    if not meta.gen_rotated_variants:
        return
    
    new_total_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants = utils.create_rotated_tiles(image)
        for i, (new_variant_name, new_variant_image) in enumerate(new_image_variants.items()):
            print(f' - var - {name}:rot-{i}')
            new_total_image_variants[f'{name}:rot-{i}'] = new_variant_image

    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del rot - {k}')
        del image_variants[k]

    image_variants.update(new_total_image_variants)

def gen_edge_variants(meta: TileMetaIn, image_variants: dict[str, Image.Image]):
    if not meta.gen_edge_variants:
        return
    
    new_total_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants = utils.create_tile_edges(image)
        for new_variant_name, new_variant_image in new_image_variants.items():
            print(f' - var - {name}:edge-{new_variant_name}')
            new_total_image_variants[f'{name}:edge-{new_variant_name}'] = new_variant_image

    image_variants.update(new_total_image_variants)

def get_manual_variants(meta: TileMetaIn, accumulated_image_variants: dict[str, Image.Image]):
    if meta.has_manual_variants:
        # Regular expression pattern to match files like name_1.png, name_10.png, name_123.png, etc.
        pattern = f'{meta.name}_\d+\.png'
        i = 0
        for root, dirs, files in os.walk("assets/tiles/"):
            # print(f'has manual vars ${meta.name} {files}')
            for filename in files:
                if not re.match(pattern, filename):
                    continue
                
                image = get_img(Path(filename).stem)
                print(f' - var - {meta.name}:mvar-{i}')
                accumulated_image_variants[f"{meta.name}:mvar-{i}"] = image
                i += 1
    else:
        image = get_img(meta.name)
        accumulated_image_variants[meta.name] = image

def main():
    tile_meta: list[TileMetaIn] = utils.read_tile_meta('assets/tiles.yml')

    images: dict[str, Image.Image] = {}
    for meta in tile_meta:
        if meta.ignore:
            continue

        print(meta.name)
        
        accumulated_image_variants: dict[str, Image.Image] = {}
        get_manual_variants(meta, accumulated_image_variants)

        split_variants_into_tiles(meta, accumulated_image_variants)
        
        # variant options can be combined
        gen_animated_variants(meta, accumulated_image_variants)
        gen_color_variants(meta, accumulated_image_variants)
        gen_rotated_variants(meta, accumulated_image_variants)
        gen_edge_variants(meta, accumulated_image_variants)

        images.update(accumulated_image_variants)
        

    
    tileset: Tileset = utils.create_tileset(images)
    tileset.save('assets/tileset')

def watch_callback(event):
    print(f"File changed: {event.src_path}")
    if event.src_path == 'assets/tileset.png':
        return
    main()

if __name__ == "__main__":
    main()
    watch_directory('assets', watch_callback)   