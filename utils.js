export function loadColors(htmlDocument, colors, clickEvent)
{
    let colorList = htmlDocument.getElementById("list-color")
    for (let i=0; i<colors.length; i++)
    {
        let colorItem = htmlDocument.createElement("div")
        colorItem.id = "color_item"+i
        colorItem.addEventListener('click', ()=>clickEvent(i))
        colorItem.className = "list-item-color"
        colorItem.style.backgroundColor = colors[i]
        colorList.appendChild(colorItem)
    }
}

export function requestServer(request, ...extra)
{
    let reader = new XMLHttpRequest()
    reader.open(request.method, request.url)
    reader.setRequestHeader("resource-type", request.requestType)
    reader.setRequestHeader("resource-path", request.body)
    reader.onreadystatechange = () =>
    {
        if (reader.readyState == 4 && reader.status == 200)
            request.onSuccess(reader.response, extra)
    }
    reader.responseType = request.responseType
    reader.send()
}

export function toRGB(str)
{
    let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
    return match ? {r:match[1], g:match[2], b:match[3]} : {r:0, g:0, b:0}
}

export function duplicateImagedata(source)
{
    let sourceData = source.data
    let copyData = new Uint8ClampedArray(sourceData.length)
    for (let i=0; i<sourceData.length; i++)
        copyData[i] = sourceData[i]
    return new ImageData(copyData, source.width, source.height)
}

export function multiplyColor(c1, c2)
{   
    c1 /= 255
    c2 /= 255
    return c1 * c2 * 255
}