var canvas;
var context;
var canvasImageData;

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
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    var reader = new XMLHttpRequest();
    reader.open("GET", "http://127.0.0.1:5500/house.png");
    reader.onreadystatechange = () =>
    {
        if (reader.readyState == 4 && reader.status == 200)
            draw_image(reader.response);
    }
    reader.responseType = 'blob';
    reader.send();
}

function on_grid_select(grid_id)
{
    var grid_item = document.getElementById(grid_id);
    var color = grid_item.style.backgroundColor;
    var rgbval = to_rgb(color);
    var imageData = duplicate_imagedata(canvasImageData);
    var pixels = imageData.data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiply_color(pixels[i], rgbval.r);
        pixels[i+1] = multiply_color(pixels[i+1], rgbval.g);
        pixels[i+2] = multiply_color(pixels[i+2], rgbval.b);
    }
    context.putImageData(imageData, 0, 0);
}

function on_reset()
{
    context.putImageData(canvasImageData, 0, 0);
}

function draw_image(blob)
{
    let bloburl = URL.createObjectURL(blob);
    let img = new Image();
    img.onload = () => 
    {
        URL.revokeObjectURL(bloburl);
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        canvasImageData = context.getImageData(0, 0, img.width, img.height);
    };
    img.src = bloburl;
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