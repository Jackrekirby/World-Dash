from pathlib import Path

import numpy as np
import yaml
from PIL import Image
from v1.pixel_pos import create_pixel_positions
from v1.structs import Pos2D, TileMeta, Tileset


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


def read_tile_meta(in_path: str) -> list[TileMeta]:
    with open(in_path, "r") as file:
        data = yaml.safe_load(file) 
    block_configs: list[TileMeta] = []

    for block_name, attributes in data.items():
        attributes = attributes or {}
        block_configs.append(TileMeta(
            name=block_name,
            ignore=attributes.get("ignore", False),
            gen_rotated_variants=attributes.get("gen_rotated_variants", False),
            animated=attributes.get("animated", False),
            color_replace=attributes.get("color_replace"),
            gen_edge_variants=attributes.get("gen_edge_variants", False),
        ))
    
    return block_configs  



def split_image(image: Image.Image, width: int, height: int) -> list[Image.Image]:    
    # Get the original size of the image
    img_width, img_height = image.size
    
    # Ensure the image can be split evenly
    if img_width % width != 0 or img_height % height != 0:
        raise ValueError("Image must have integer divisible width and height")
    
    # Create a list to store the split images
    split_images: list[Image.Image] = []
    
    # Loop through the height of the image and create smaller images
    for y in range(0, img_height, height):
        for x in range(0, img_width, width):
            # Define the box (left, upper, right, lower) to crop
            box = (x, y, x + width, y + height)
            split_img = image.crop(box)
            split_images.append(split_img)
    
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