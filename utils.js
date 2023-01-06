//Appends the colors within the html document
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

/*
 * request holds the json data needed by backend.
 * 
 * The following is the json structure for request:
 * {url: "", method:"", requestType:"", responseType:"", body:"", onSuccess: ""}
 * url : URL of host
 * method : GET/PUT/POST etc. In this project, only GET is used.
 * requestType : file-list/image. If file-list then server fetches the relative paths of all files within the assets/floors directory.
 * responseType : text/blob. test is used when fetching the relative paths and blo is used when fetching images.
 * body: For now, it only holds the relative path of image files. This will be empty when fetching the relative paths of files from server.
 * onSuccess : It holds the callback function to be called once the download is successful.
 *  
 * 
 * ...extra is a variadic argument that collects all the values within a single array regardless of their type 
 */
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

/*
 * used for extracting the rgb values from the style attributes of html tag. 
 */
export function toRGB(str)
{
    let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
    return match ? {r:match[1], g:match[2], b:match[3]} : {r:0, g:0, b:0}
}

//Used for deep-copying the imagedata
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