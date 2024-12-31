import numpy as np
from PIL import Image


# Function to calculate the lightness of a color (HSL model)
def calculate_lightness(rgb):
    r, g, b = [x / 255.0 for x in rgb]
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    return (max_val + min_val) / 2

def image_to_lightness_indices(image_path):
    # Open the image
    image = Image.open(image_path).convert("RGB")

    # Get the image data as a numpy array
    img_array = np.array(image)

    # Flatten the array to calculate lightness for each pixel
    h, w, _ = img_array.shape
    pixels = img_array.reshape(-1, 3)

    # Calculate lightness for each pixel and keep track of unique colors
    unique_colors = {}
    for rgb in pixels:
        rgb_tuple = tuple(rgb)
        if rgb_tuple not in unique_colors:
            unique_colors[rgb_tuple] = calculate_lightness(rgb_tuple)

    # Sort unique colors by lightness
    sorted_colors = sorted(unique_colors.keys(), key=lambda c: unique_colors[c])

    # Create a mapping from color to index
    color_to_index = {color: i for i, color in enumerate(sorted_colors)}

    # Map each pixel to its index based on lightness
    indices = np.array([color_to_index[tuple(rgb)] for rgb in pixels])

    # Reshape indices to match the original image dimensions
    indices_2d = indices.reshape(h, w)

    return indices_2d

if __name__ == "__main__":
    # Path to the input image
    image_path = "assets/fade_map.png"  # Replace with your image file

    # Convert image to 2D array of indices
    lightness_indices = image_to_lightness_indices(image_path)

    # Output the result
    print("2D Array of Lightness Indices:")
    print(lightness_indices)

# python .\src\local\main.py