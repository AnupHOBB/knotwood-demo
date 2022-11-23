function on_page_load()
{
    var image = document.getElementById("image");
    var reader = new XMLHttpRequest();
    reader.open("GET", "http://127.0.0.1:5500/house.png");
    reader.onreadystatechange = function()
    {
        if (reader.readyState == 4 && reader.status == 200)
        {
            console.log(reader.response);
            var url = window.URL || window.webkitURL;
            image.src = url.createObjectURL(reader.response);
        }
    }
    reader.responseType = 'blob';
    reader.send();
}

function on_grid_select(grid_id, image_id)
{
    var grid_item = document.getElementById(grid_id);
    var color = grid_item.style.backgroundColor;
    var image = document.getElementById(image_id);
    image.style.backgroundColor = color;
}