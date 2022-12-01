const IMAGE_DATAS = [];

var contextBackground;
var activeImageData;

function onPageLoad()
{
    requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:"house_floor.png", onSuccess:onImageDownload}, onBackgroundLoad);
    requestServer({url:BACKEND, method:"POST", requestType:"file-list", responseType:"text", body:"", onSuccess:onFileListDownload});
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
    let pixels = activeImageData.data;
    let texels = IMAGE_DATAS[index].data;
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = texels[i];
        pixels[i+1] = texels[i+1];
        pixels[i+2] = texels[i+2];
        pixels[i+3] = texels[i+3];
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
    activeImageData = contextBackground.getImageData(0, 0, img.width, img.height);
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
    for (let i=0; i<(names.length-1); i++)
        requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:names[i], onSuccess:onImageDownload}, onTextureLoad, i);
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

function requestServer(request, ...extra)
{
    let reader = new XMLHttpRequest();
    reader.open(request.method, request.url);
    reader.setRequestHeader("resource-type", request.requestType);
    reader.setRequestHeader("resource-path", request.body);
    reader.onreadystatechange = () =>
    {
        if (reader.readyState == 4 && reader.status == 200)
            request.onSuccess(reader.response, extra);
    }
    reader.responseType = request.responseType;
    reader.send();
}

function toRGB(str)
{
    let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? {r:match[1], g:match[2], b:match[3]} : {r:0, g:0, b:0};
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