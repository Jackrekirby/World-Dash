import math
import random
from pathlib import Path

import numpy as np
import yaml
from PIL import Image
from v1.pixel_pos import create_pixel_positions
from v1.structs import Pos2D, Pos3D, TileMetaIn, Tileset


def create_tileset(images: dict[str, Image.Image]) -> tuple[dict[str, Pos2D], Image.Image]:
    # Number of images
    num_images = len(images)

    # Calculate the number of rows and columns to make the image as square as possible
    ncols = int(np.ceil(np.sqrt(num_images)))
    nrows = int(np.ceil(num_images / ncols))

    # Get the size of each individual image (assuming all images are the same size)
    width, height = list(images.values())[0].size

    # Create a new blank image with enough space to fit the grid of images
    new_width = ncols * width
    new_height = nrows * height
    image = Image.new('RGBA', (new_width, new_height))

    meta: dict[str, Pos2D] = {}
    # Place the images into the new image grid
    for i, name in enumerate(images):
        row = i // ncols
        col = i % ncols
        # Calculate the position to paste the image into the new image
        x = col * width
        y = row * height
        image.paste(images[name], (x, y))
        # TODO: set pixel position not index for when tileset contains different sized tiles
        meta[name] = Pos2D(col, row) 

    return Tileset(meta, image)

def get_filenames_without_extension(directory: str):
    # Convert the directory string to a Path object
    path = Path(directory)
    
    # Use the glob method to find all files and get filenames without extensions
    filenames = [file.stem for file in path.iterdir() if file.is_file()]
    
    return filenames

def create_tileset_from_dir(in_dir: str, out_path: str):
    filenames: list[str] = get_filenames_without_extension(in_dir)
    images: dict[str, Image.Image] = {}
    for filename in filenames:
        name: str = filename
        img_path: str = f"{in_dir}/{name}.png"
        image = Image.open(img_path)
        images[name] = image

    tileset: Tileset = create_tileset(images)
    tileset.save()


def read_tile_meta(in_path: str) -> list[TileMetaIn]:
    with open(in_path, "r") as file:
        data = yaml.safe_load(file) 
    block_configs: list[TileMetaIn] = []

    for block_name, attributes in data.items():
        attributes = attributes or {}
        block_configs.append(TileMetaIn(
            name=block_name,
            ignore=attributes.get("ignore", False),
            gen_rotated_variants=attributes.get("gen_rotated_variants", False),
            animated=attributes.get("animated", False),
            color_replace=attributes.get("color_replace"),
            gen_edge_variants=attributes.get("gen_edge_variants", False),
            has_manual_variants=attributes.get("has_manual_variants", False),
            is_multi_tile=attributes.get("is_multi_tile", False),
        ))
    
    return block_configs  



def split_image(image: Image.Image, width: int, height: int) -> dict[str, Image.Image]:    
    # Get the original size of the image
    img_width, img_height = image.size
    
    # Ensure the image can be split evenly
    if img_width % width != 0 or img_height % height != 0:
        raise ValueError("Image must have integer divisible width and height")
    
    # Create a list to store the split images
    split_images: dict[str, Image.Image] = {}
    
    # Loop through the height of the image and create smaller images
    for y in range(0, img_height, height):
        for x in range(0, img_width, width):
            # Define the box (left, upper, right, lower) to crop
            box = (x, y, x + width, y + height)
            split_img = image.crop(box)
            split_images[f"{math.floor(x/width)}_{math.floor(y/height)}"] = split_img
    
    return split_images

# def get_rgbs_from_image(image: Image.Image) -> np.ndarray:
#     image2_pixels = np.array(image.convert("RGBA"))
#     unique_colors = np.unique(image2_pixels.reshape(-1, 4), axis=0)
#     return unique_colors

def replace_color_with_variants(image: Image.Image, pallette: Image.Image) -> list[Image.Image]:
    # Convert images to RGB mode (if not already in RGB)
    image1 = image.convert("RGBA")

    # Extract the pixels from the second image to find unique colors
    color_pallete = np.array(pallette.convert("RGBA"))

    # List to store the resulting images
    result_images = []

    # Convert the first image into a numpy array for processing
    image1_pixels = np.array(image1)

    target_colors = color_pallete[:, 0]

    # Iterate through each unique color from the second image
    for i in range(color_pallete.shape[1]):
        new_colors = color_pallete[:, i]
        modified_image = image1_pixels.copy()

        for j, color in enumerate(new_colors):
            # Create a mask for the target color (255, 0, 255, 255) in the first image
            mask = np.all(image1_pixels == target_colors[j], axis=-1)
            # Replace the target color with the current unique color
            modified_image[mask] = color

        # Convert the numpy array back to an image and append to the result list
        result_image = Image.fromarray(modified_image)
        result_images.append(result_image)

    return result_images

def create_rotated_tiles(image: Image.Image) -> dict[str, Image.Image]:
    ps = create_pixel_positions()
    mask: list[bool] = [p.z == 10 for p in ps]
    images: dict[str, Image.Image] = {}
    image_data = np.array(image)
    
    # Reshape the mask to match the image shape
    mask_array = np.array(mask).reshape(image_data.shape[:2])  # Shape (16, 16) or as needed
    
    # Set all pixels not matching the mask to 0 (black)
    for i in range(image_data.shape[0]):  # Height
        for j in range(image_data.shape[1]):  # Width
            if not mask_array[i, j]:
                image_data[i, j] = [0, 0, 0, 0]  # Assuming RGBA, or modify based on your image mode
    
    # Convert the modified array back to an image
    modified_image = Image.fromarray(image_data)
    
    rots = [[], [Image.FLIP_LEFT_RIGHT], [Image.FLIP_TOP_BOTTOM], [Image.FLIP_LEFT_RIGHT, Image.FLIP_TOP_BOTTOM]]

    for ii, transpose_methods in enumerate(rots):
        # Flip the image horizontally
        flipped_image = modified_image.copy()
        for transpose_method in transpose_methods:
            flipped_image = flipped_image.transpose(transpose_method)
        
        # Create a copy of the original image for modification
        original_image_data = np.array(image)
        offset = [0, 0, 8, 8][ii]
        # Set non-zero pixels from the flipped image onto the original image copy
        for i in range(8):  # Height
            for j in range(image_data.shape[1]):  # Width
                dd = flipped_image.getdata()[(i+offset) * image_data.shape[1] + j]
                if np.any(dd):  # Check if the pixel is non-zero
                    original_image_data[i, j] = dd
        
        # Convert the modified original image back to an Image object
        final_image = Image.fromarray(original_image_data)

        key = f"rot_{['', 'x', 'y', 'xy'][ii]}"
        images[key] = final_image
    return images

def generate_boolean_combinations(n: int) -> list[list[bool]]:
    result = []

    # Total number of combinations is 2^n
    total_combinations = 1 << n

    for i in range(total_combinations):
        combination = []

        for j in range(n):
            # Use bitwise AND to determine if the j-th bit in i is set
            combination.append((i & (1 << j)) != 0)

        result.append(combination)

    return result

def create_mask(ps: list[Pos3D], combo: list[int], offset: int) -> list[bool]:
    xs = []
    ys = []
    if combo[0]:
        xs.append(1 + offset)
    if combo[1]:
        xs.append(8 - offset)
    if combo[2]:
        ys.append(1 + offset)
    if combo[3]:
        ys.append(8 - offset)
    
    mask = [p.z == 10 and (p.x in xs or p.y in ys) for p in ps]
    return mask

def create_edge_key(enabledEdges: list[bool]):
    return f"{'ny' if enabledEdges[0] else ''}{'py' if enabledEdges[1] else ''}{'nx' if enabledEdges[2] else ''}{'px' if enabledEdges[3] else ''}"

def boolean_mask_to_alpha(mask: list[bool], chance, min, max) -> list[int]:
    alphas: list[int] = []
    for item in mask:
        if item and random.uniform(0, 1) < chance:
            alphas.append(math.floor(random.uniform(min, max) * 255))
        else:
            alphas.append(0)
    return alphas

def apply_mask_to_image(image: Image.Image, mask: list[int]) -> Image.Image:
    image_data = np.array(image)

    # Ensure the mask has the same number of pixels as the image's height and width
    mask_array = np.array(mask).reshape(image_data.shape[:2])  # Shape (17, 16)
    # Iterate through each pixel and apply the mask
    for i in range(image_data.shape[0]):  # Height
        for j in range(image_data.shape[1]):  # Width
            # set alpha to that of mask
            image_data[i, j][3] = mask_array[i, j]

    # Save the modified image
    modified_image = Image.fromarray(image_data)
    return modified_image

def int_to_bool_array(n: int, length: int) -> list[bool]:
    # Convert the integer to binary and strip the "0b" prefix
    binary_str = bin(n)[2:].zfill(length)
    # Map each binary digit to a boolean value
    return [bit == '1' for bit in binary_str]

def create_tile_edges(image: Image.Image) -> dict[str, Image.Image]:
    ps = create_pixel_positions()

    images: dict[str, Image.Image] = {}
        
    for i in range(16): # ny py nx px
        edge_combo = int_to_bool_array(i, 4)
        if sum(edge_combo) != 1:
            continue # at the moment only single edge tiles are being used
        
        # create mask for each ring of pixels from outside to inside
        masks = [
            boolean_mask_to_alpha(create_mask(ps, edge_combo, 0), 0.5, 0.5, 1.0),
            boolean_mask_to_alpha(create_mask(ps, edge_combo, 1), 0.25, 0.3, 0.5),
            boolean_mask_to_alpha(create_mask(ps, edge_combo, 2), 0.125, 0.1, 0.3)
        ]
        # combine all masks into a single mask
        mask: list[int] = []
        for i in range(256): # 256 = number of pixels
            ss = 0
            for m in masks:
                ss += m[i]
            mask.append(ss)

        key = create_edge_key(edge_combo)
        image = apply_mask_to_image(image, mask)
        images[key] = image

    return images