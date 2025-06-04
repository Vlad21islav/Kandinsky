let prd = null;
let uuid = '';
let num = 0;

function headers() {
    return {
        'X-Key': 'Key ' + "7EFB01015D3204CF36339F7F1AA91C63",
        'X-Secret': 'Secret ' + "E5A34DDA35CFED2629E95CD6D584C1D4",
    }
}
function params() {
    pageWidth = resolution()[0];
    pageHeight = resolution()[1];
    return {
        type: "GENERATE",
        style: style.value,
        width: "1024",
        height: "1024",
        num_images: 1,
        negativePromptUnclip: "",
        generateParams: {
            query: document.getElementById("query").value,
        }
    }
}

function resolution() {
    let pageWidth = document.documentElement.scrollWidth
    let pageHeight = document.documentElement.scrollHeight

    return [pageWidth, pageHeight];
}

async function generate() {
    document.getElementById("query").style = "display: none;";
    document.getElementById("btn").style = "display: none;";

    if (resolution()[0] > resolution()[1]) {
        document.getElementById("img").style = "border-radius: 5px;height: 86%;"
    } else {
        document.getElementById("img").style = "border-radius: 5px;width: 100%;"
    }

    let model_id = 0;
    {
        let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/models', {
            method: 'GET',
            headers: headers(),
        });
        res = await res.json();
        model_id = res[0].id;
    }
    
    let formData = new FormData();
    formData.append('model_id', model_id);
    formData.append('params', new Blob([JSON.stringify(params())], { type: "application/json" }));

    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/run', {
        method: 'POST',
        headers: headers(),
        body: formData,
    });
    let json = await res.json();
    console.log(json);

    uuid = json.uuid;
    if (json.uuid) prd = setInterval(check, 3000);
}

async function check() {
    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/status/' + uuid, {
        method: 'GET',
        headers: headers(),
    });
    let json = await res.json();
    console.log(json);


    switch (json.status) {
        case 'INITIAL':
            num++;
            document.getElementById('num').innerHTML = num.toString() + '/~21';
        case 'PROCESSING':
            break;

        case 'DONE':
            document.getElementById('img').src = 'data:image/jpeg;charset=utf-8;base64,' + json.images[0];
            clearInterval(prd);
            num = 0;
            generate();
            break;

        case 'FAIL':
            clearInterval(prd);
            break;
    }
}

window.onload = async () => {
    let res = await fetch('https://cdn.fusionbrain.ai/static/styles/api');
    res = await res.json();
    for (let style of res) {
        document.getElementById('style').innerHTML += `<option value="${style.name}">${style.name}</option>`;
    }
}
