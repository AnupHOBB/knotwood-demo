const BACKEND = "http://127.0.0.1:8080";
const ASSET_ROOT = "assets/";
const IMAGE_DATAS = [];

var contextBackground;
var activeImageData;
var originalImageData;

class rgb
{
    constructor(r,g,b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

function onPageLoad()
{
    requestServer(ASSET_ROOT+"house_floor.png", "blob", onImageDownload, onBackgroundLoad);
    requestServer(BACKEND, "text", onFileListDownload);
}

function onReset()
{
    activeImageData = originalImageData;
    contextBackground.putImageData(activeImageData, 0, 0);
}

function onColorSelect(grid_id)
{
    let gridItem = document.getElementById(grid_id);
    let rgbval = toRGB(gridItem.style.backgroundColor);
    let imageData = duplicateImagedata(activeImageData);
    let pixels = imageData.data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiplyColor(pixels[i], rgbval.r);
        pixels[i+1] = multiplyColor(pixels[i+1], rgbval.g);
        pixels[i+2] = multiplyColor(pixels[i+2], rgbval.b);
    }
    contextBackground.putImageData(imageData, 0, 0);
}

function onImageSelect(index)
{
    activeImageData = duplicateImagedata(originalImageData);
    let pixels = activeImageData.data;
    let texels = IMAGE_DATAS[index].data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiplyColor(pixels[i], texels[i]);
        pixels[i+1] = multiplyColor(pixels[i+1], texels[i+1]);
        pixels[i+2] = multiplyColor(pixels[i+2], texels[i+2]);
        pixels[i+3] = multiplyColor(pixels[i+3], texels[i+3]);;
    }
    contextBackground.putImageData(activeImageData, 0, 0);  
}

function onBackgroundLoad(img)
{
    let canvas = document.getElementById("canvas_background");
    canvas.width = img.width;
    canvas.height = img.height;
    contextBackground = canvas.getContext("2d");
    contextBackground.drawImage(img, 0, 0);
    originalImageData = contextBackground.getImageData(0, 0, img.width, img.height);
    activeImageData = originalImageData;
}

function onTextureLoad(img, index)
{
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.className = "list-item-image";
    canvas.setAttribute('onclick','onImageSelect('+index+')');
    let canvasList = document.getElementById("list-image");
    canvasList.appendChild(canvas);
    let context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
    IMAGE_DATAS[index] = context.getImageData(0, 0, img.width, img.height);
}

function onFileListDownload(response)
{
    let names = response.split('|');
    for (let i=0; i<names.length; i++)
        requestServer(ASSET_ROOT+names[i], "blob", onImageDownload, onTextureLoad, i);
}

function onImageDownload(response, extra)
{
    let bloburl = URL.createObjectURL(response);
    let img = new Image();
    img.src = bloburl;
    img.onload = () => 
    {
        URL.revokeObjectURL(bloburl);
        extra[0](img, extra[1]);
    };
}

function requestServer(url, type, onSuccess, ...extra)
{
    let reader = new XMLHttpRequest();
    reader.open("GET", url);
    reader.onreadystatechange = () =>
    {
        if (reader.readyState == 4 && reader.status == 200)
            onSuccess(reader.response, extra)
    }
    reader.responseType = type;
    reader.send();
}

function toRGB(str)
{
    let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? new rgb(match[1], match[2], match[3]) : new rgb(0,0,0);
}

function duplicateImagedata(source)
{
    let sourceData = source.data;
    let copyData = new Uint8ClampedArray(sourceData.length);
    for (let i=0; i<sourceData.length; i++)
        copyData[i] = sourceData[i];
    return new ImageData(copyData, source.width, source.height);
}

function multiplyColor(c1, c2)
{   
    c1 /= 255;
    c2 /= 255;
    return c1 * c2 * 255;
}