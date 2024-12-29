import v1.utils as utils
from PIL import Image
from v1.structs import TileMeta, Tileset


def get_img(name: str) -> Image.Image:
    img_path: str = f"assets/new/{name}.png"
    image = Image.open(img_path)
    return image


# X ignore
# - gen_rotated_variants
# X animated
# X color_replace [take first color from each row as the color to replace]
# - gen_edge_variants
# - recolor? (orchid)
# add cursor and player
tilesize = 16

def gen_animated_variants(meta: TileMeta, image_variants: dict[str, Image.Image]):
    if not meta.animated:
        return 
    
    new_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants_list = utils.split_image(image, width=tilesize, height=tilesize)
        for i, new_image_variant in enumerate(new_image_variants_list):
            print(f' - var - {name}_f{i}')
            new_image_variants[f'{name}_f{i}'] = new_image_variant

    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del ani - {k}')
        del image_variants[k]

    image_variants.update(new_image_variants)

def gen_color_variants(meta: TileMeta, image_variants: dict[str, Image.Image]):
    if meta.color_replace is None:
        return
    
    new_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants_list = utils.replace_color_with_variants(image, get_img(meta.color_replace))
        for i, new_image_variant in enumerate(new_image_variants_list):
            print(f' - var - {name}_c{i}')
            new_image_variants[f'{name}_c{i}'] = new_image_variant
    
    keys = list(image_variants.keys())
    for k in keys:
        print(f' - del col - {k}')
        del image_variants[k]

    image_variants.update(new_image_variants)

def gen_rotated_variants(meta: TileMeta, image_variants: dict[str, Image.Image]):
    if not meta.gen_rotated_variants:
        return
    
    new_total_image_variants: dict[str, Image.Image] = {}
    for name, image in image_variants.items():
        new_image_variants = utils.create_rotated_tiles(image)
        for new_variant_name, new_variant_image in new_image_variants.items():
            print(f' - var - {name}_{new_variant_name}')
            new_total_image_variants[f'{name}_{new_variant_name}'] = new_variant_image

    image_variants.update(new_total_image_variants)

def main():
    
    tile_meta: list[TileMeta] = utils.read_tile_meta('assets/new/meta.yml')

    images: dict[str, Image.Image] = {}
    for meta in tile_meta:
        if meta.ignore:
            continue

        print(meta.name)

        image = get_img(meta.name)

        accumulated_image_variants: dict[str, Image.Image] = {meta.name: image}
        
        # variant options can be combined
        gen_animated_variants(meta, accumulated_image_variants)
        gen_color_variants(meta, accumulated_image_variants)
        gen_rotated_variants(meta, accumulated_image_variants)

        if len(accumulated_image_variants) == 0:
            images[meta.name] = image
        else: 
            images.update(accumulated_image_variants)
        

    
    tileset: Tileset = utils.create_tileset(images)
    tileset.save('assets/procedural/tileset')


if __name__ == "__main__":
    main()        