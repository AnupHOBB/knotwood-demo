import { loadColors, requestServer, toRGB, duplicateImagedata, multiplyColor } from "./utils.js"

const IMAGE_DATAS = []
const COLORS = ["#FEA47F", "#EAB543", "#55E6C1", "#CAD3C8", "#F97F51", "#F8EFBA", "#58B19F", "#819BB3", "#E27AAB"]

var contextBackground
var activeImageData

window.onload = onPageLoad

function onPageLoad()
{
    loadColors(document, COLORS, (i)=>onColorSelect("color_item"+i))

    //Used for downloading the base background floor image
    requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:"house_floor.png", onSuccess:onImageDownload}, onBackgroundLoad)
    
    /* 
     * The following function is used for downloading all the relative paths of all floor textures.
     * 
     * Before downloading the floor textures , the relative path of all the floor textures are fetched first.
     * 
     * For example : for the first file inside the assets/floors folder, the relative path provided by backend will be floors/Living_floorTile1_L.png. 
     * 
     * This was done to make the application capable of automatically detecting all the floor textures  within the assets/floors folder thereby
     * making it easier for us to increase or decrease or change the floor textures.
     * 
     * After collecting the relative path for all the images within the assets/floors directory, the frontend can thus know how many
     * images to fetch and the front end will send these paths to the backend individually and one at a time to retrieve all floor textures.
     * 
     * The floor textures  appear on the top right corner of UI which is used to change the image of the floor.
    */
    requestServer({url:BACKEND, method:"POST", requestType:"file-list", responseType:"text", body:"", onSuccess:onFileListDownload})
}

function onColorSelect(grid_id)
{
    let gridItem = document.getElementById(grid_id)
    let rgbval = toRGB(gridItem.style.backgroundColor)
    let imageData = duplicateImagedata(activeImageData)
    let pixels = imageData.data

    //Colors are mixed with the rgb values of the images.
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = multiplyColor(pixels[i], rgbval.r)
        pixels[i+1] = multiplyColor(pixels[i+1], rgbval.g)
        pixels[i+2] = multiplyColor(pixels[i+2], rgbval.b)
    }
    contextBackground.putImageData(imageData, 0, 0)
}

function onImageSelect(index)
{
    let pixels = activeImageData.data
    let texels = IMAGE_DATAS[index].data

    /**
     *  The rgba value within the selected floor image is called texel here.
     * 
     *  The rgba value of base floor image is called pixel.
     * 
     *  The rgba values of base floor image is directly replaced by the rgba values of the selected floor image.
     */
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = texels[i]
        pixels[i+1] = texels[i+1]
        pixels[i+2] = texels[i+2]
        pixels[i+3] = texels[i+3]
    }
    contextBackground.putImageData(activeImageData, 0, 0)
}

//Called once the base floor image is downloaded
function onBackgroundLoad(img)
{
    let canvas = document.getElementById("canvas_background")
    canvas.width = img.width
    canvas.height = img.height
    contextBackground = canvas.getContext("2d")
    contextBackground.drawImage(img, 0, 0)
    activeImageData = contextBackground.getImageData(0, 0, img.width, img.height)
}


/**
 * Called once the floor textures are loaded.
 * 
 * This function is called for each individual texture separately. 
 */
function onTextureLoad(img, index)
{
    let canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    canvas.className = "list-item-image"
    canvas.addEventListener('click', ()=>onImageSelect(index))
    let canvasList = document.getElementById("list-image")
    canvasList.appendChild(canvas)
    let context = canvas.getContext("2d")
    context.drawImage(img, 0, 0)
    IMAGE_DATAS[index] = context.getImageData(0, 0, img.width, img.height)
}

/**
 * 
 * Called once the relative paths of all floor textures are downloaded.
 * 
 * Here, the value of BACKEND is not defined within the file. The value of this variable will be appended from backend during runtime.
 * This was done so that there would be no need to hardcode the host url within this file, thus making deployment easy.
 *
 */

function onFileListDownload(response)
{
    let names = response.split('|')
    for (let i=0; i<(names.length-1); i++)
        requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:names[i], onSuccess:onImageDownload}, onTextureLoad, i)
}


/*
 * Called once the floor textures are downloaded.
 * 
 * This function is called for each individual texture separately. 
 */
function onImageDownload(response, extra)
{
    let bloburl = URL.createObjectURL(response)
    let img = new Image()
    img.src = bloburl
    img.onload = () => 
    {
        URL.revokeObjectURL(bloburl)


        /*
         * extra[0] = onTextureLoad
         * extra[1] = i (this is the index passed from the function onFileListDownload)
         * 
         * onTextureLoad and i are collected within the variadic argument "...extra" in the requestServer function as an array.
         * This entire array is passed back to the onImageDownload function and stored in the variable "extra" in this function.
         * Thus, the contents of the array extra will be as follows :-
         * 
         * extra = [onTextureLoad, i]
         */
        extra[0](img, extra[1])
    }
}