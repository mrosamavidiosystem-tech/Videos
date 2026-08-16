async function fetchFile(file){
    return new Uint8Array( await file.arrayBuffer());
}
function setProgress(value){
    $("bar").style.width = Math.max(0,Math.min(100,value)) + "%";
}
function setStatus(text){
    $("status").textContent = text;
}
$("new").onclick =() => {
    const uuid = crypto.randomUUID();
    $("uuid").value = uuid;
    console.log("MOVS UUID:",uuid);
};
$("start").onclick = startUpload;
$("cancel").onclick =() => {
    cancelled = true;
    $("cancel").disabled = true;
    setStatus( "⛔ جارٍ إلغاء العملية...");
};
window.addEventListener("load", () => {
    console.log("crossOriginIsolated =",window.crossOriginIsolated);
    if(!window.crossOriginIsolated){
        console.warn("crossOriginIsolated=false");
    }
});
