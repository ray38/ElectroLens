
export function queueUpdateProgressBar() {
    let currentWidth = parseInt(document.getElementById("loading-progress").style["width"]);
    let barQueueLength = parseInt(document.getElementById("loading-progress").getAttribute("queueLength"));
    let newWidth = (currentWidth + barQueueLength).toString();
    if (newWidth && newWidth <= 100.0 && document.getElementById("loading-progress")) {
        document.getElementById("loading-progress").style["width"] = newWidth+"%";
    }
    clearProgressMessage();
}

export function streamUpdateProgressBar(chunkSize, totalSize, filename) {
    let totalChunks = totalSize / chunkSize;
    let barQueueLength = parseInt(document.getElementById("loading-progress").getAttribute("queueLength"));
    let forThisQueueItem = ( barQueueLength * ( 1.0 / totalChunks ) );
    let currentWidth = parseInt(document.getElementById("loading-progress").style["width"]);
    let newWidth = (currentWidth + forThisQueueItem).toString();
    if (newWidth && newWidth <= 100.0 && document.getElementById("loading-progress")) {
        document.getElementById("loading-progress").style["width"] = newWidth+"%";
    }
    setProgressMessage("Loading " + filename);
}

export function d3csvUpdateProgressBar(currentRow, totalRows, filename) {
    let totalChunks = 10;
    let oneTenth = Math.round(totalRows / totalChunks);
    if( currentRow % oneTenth == 0 ) {
        let barQueueLength = parseInt(document.getElementById("loading-progress").getAttribute("queueLength"));
        let forThisQueueItem = ( barQueueLength * ( 1.0 / totalChunks ) );
        let currentWidth = parseInt(document.getElementById("loading-progress").style["width"]);
        let newWidth = (currentWidth + forThisQueueItem).toString();
        if (newWidth && newWidth <= 100.0 && document.getElementById("loading-progress")) {
            document.getElementById("loading-progress").style["width"] = newWidth+"%";
        }
        setProgressMessage("Loading " + filename);
    } 
}

export function clearProgressMessage() {
    if (document.getElementById("loading-progress")) {
        document.getElementById("loading-message").innerHTML = "";
    }
}

export function setProgressMessage(newMessage) {
    if (document.getElementById("loading-message")) {
        document.getElementById("loading-message").innerHTML = "<h5>"+newMessage+"</h5>";
    }
}