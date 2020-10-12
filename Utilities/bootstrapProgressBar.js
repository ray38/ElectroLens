
export function queueUpdateProgressBar() {
    let currentWidth = parseInt(document.getElementById("loading-progress").style["width"]);
    let barQueueLength = parseInt(document.getElementById("loading-progress").getAttribute("queueLength"));
    let newWidth = (currentWidth + barQueueLength).toString();
    document.getElementById("loading-progress").style["width"] = newWidth+"%";
}

export function streamUpdateProgressBar(chunkSize, totalSize, filename) {
    let totalChunks = totalSize / chunkSize;
    let barQueueLength = parseInt(document.getElementById("loading-progress").getAttribute("queueLength"));
    let forThisQueueItem = ( barQueueLength * ( 1.0 / totalChunks ) );
    let currentWidth = parseInt(document.getElementById("loading-progress").style["width"]);
    let newWidth = (currentWidth + forThisQueueItem).toString();
    document.getElementById("loading-progress").style["width"] = newWidth+"%";
    setProgressMessage("Loading " + filename);
}

export function clearProgressMessage() {
    document.getElementById("loading-message").innerHTML = "";
}

export function setProgressMessage(newMessage) {
    document.getElementById("loading-message").innerHTML = "<h5>"+newMessage+"</h5>";
}