const ROOT = "http://127.0.0.1:5500/assets/";
const IMAGE_GRID_BASE_ID = "canvas_image";
const IMAGES = ["floor1.png", "floor2.png", "floor3.png"];
const images_data = new Array(3);

var context_background;
var active_image_data;
var original_image_data;

class rgb
{
    constructor(r,g,b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

function on_page_load()
{
    let canvas_background = document.getElementById("canvas_background");
    context_background = canvas_background.getContext("2d");
    load_image(canvas_background, ROOT+"house_floor.png", on_background_load, -1);
    load_textures();
}

function on_reset()
{
    active_image_data = original_image_data;
    context_background.putImageData(active_image_data, 0, 0);
}

function on_color_select(grid_id)
{
    var grid_item = document.getElementById(grid_id);
    var color = grid_item.style.backgroundColor;
    var rgbval = to_rgb(color);
    var image_data = duplicate_imagedata(active_image_data);
    var pixels = image_data.data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiply_color(pixels[i], rgbval.r);
        pixels[i+1] = multiply_color(pixels[i+1], rgbval.g);
        pixels[i+2] = multiply_color(pixels[i+2], rgbval.b);
    }
    context_background.putImageData(image_data, 0, 0);
}

function on_image_select(index)
{
    active_image_data = duplicate_imagedata(original_image_data);
    var pixels = active_image_data.data;
    var texels = images_data[index].data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiply_color(pixels[i], texels[i]);
        pixels[i+1] = multiply_color(pixels[i+1], texels[i+1]);
        pixels[i+2] = multiply_color(pixels[i+2], texels[i+2]);
        pixels[i+3] = multiply_color(pixels[i+3], texels[i+3]);;
    }
    context_background.putImageData(active_image_data, 0, 0);  
}

function on_background_load(imageData, index)
{
    original_image_data = imageData;
}

function on_texture_load(imageData, index)
{
    images_data[index] = imageData;
}

function load_textures()
{
    for (let i=0; i<IMAGES.length; i++)
        load_image(document.getElementById(IMAGE_GRID_BASE_ID+i), ROOT+IMAGES[i], on_texture_load, i)
}

function load_image(canvas, url, onload, index)
{
    var reader = new XMLHttpRequest();
    reader.open("GET", url);
    reader.onreadystatechange = () =>
    {
        if (reader.readyState == 4 && reader.status == 200)
            draw_image(canvas, reader.response, onload, index);
    }
    reader.responseType = 'blob';
    reader.send();
}

function draw_image(canvas, blob, onload, index)
{
    let bloburl = URL.createObjectURL(blob);
    let img = new Image();
    img.src = bloburl;
    img.onload = () => 
    {
        URL.revokeObjectURL(bloburl);
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        onload(context.getImageData(0, 0, img.width, img.height), index);
    };
}

function to_rgb(str)
{
    var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? new rgb(match[1], match[2], match[3]) : new rgb(0,0,0);
}

function duplicate_imagedata(source)
{
    let source_data = source.data;
    let copy_data = new Uint8ClampedArray(source_data.length);
    for (let i=0; i<source_data.length; i++)
        copy_data[i] = source_data[i];
    return new ImageData(copy_data, source.width, source.height);
}

function multiply_color(c1, c2)
{   
    c1 /= 255;
    c2 /= 255;
    let c3 = c1 * c2;
    return c3 * 255;
}