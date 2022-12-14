
import { loadColors, requestServer, toRGB, duplicateImagedata, multiplyColor } from "./utils.js"

const IMAGE_DATAS = []
const COLORS = ["#FEA47F", "#EAB543", "#55E6C1", "#CAD3C8", "#F97F51", "#F8EFBA", "#58B19F", "#819BB3", "#E27AAB"]

var contextBackground
var activeImageData

window.onload = onPageLoad

function onPageLoad()
{
    loadColors(document, COLORS, (i)=>onColorSelect("color_item"+i))
    requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:"house_floor.png", onSuccess:onImageDownload}, onBackgroundLoad)
    requestServer({url:BACKEND, method:"POST", requestType:"file-list", responseType:"text", body:"", onSuccess:onFileListDownload})
}

function onColorSelect(grid_id)
{
    let gridItem = document.getElementById(grid_id)
    let rgbval = toRGB(gridItem.style.backgroundColor)
    let imageData = duplicateImagedata(activeImageData)
    let pixels = imageData.data
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
    for(let i=0; i<pixels.length; i+=4)
    {
        pixels[i] = texels[i]
        pixels[i+1] = texels[i+1]
        pixels[i+2] = texels[i+2]
        pixels[i+3] = texels[i+3]
    }
    contextBackground.putImageData(activeImageData, 0, 0)
}

function onBackgroundLoad(img)
{
    let canvas = document.getElementById("canvas_background")
    canvas.width = img.width
    canvas.height = img.height
    contextBackground = canvas.getContext("2d")
    contextBackground.drawImage(img, 0, 0)
    activeImageData = contextBackground.getImageData(0, 0, img.width, img.height)
}

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

function onFileListDownload(response)
{
    let names = response.split('|')
    for (let i=0; i<(names.length-1); i++)
        requestServer({url:BACKEND, method:"GET", requestType:"image", responseType:"blob", body:names[i], onSuccess:onImageDownload}, onTextureLoad, i)
}

function onImageDownload(response, extra)
{
    let bloburl = URL.createObjectURL(response)
    let img = new Image()
    img.src = bloburl
    img.onload = () => 
    {
        URL.revokeObjectURL(bloburl)
        extra[0](img, extra[1])
    }
}