const STORJ_ENDPOINT = "https://gateway.storjshare.io";
const STORJ_BUCKET = "UPLOUDE"
const STORJ_ACCESS_KEY = "jwpzqwze23opztdku5qcsaxy7ppq"
const STORJ_SECRET_KEY = "jyzccnavnzb7qovb7lupzxgmawckvm5rgcpfgngt2ayogoil3vyne"
const PART_SECONDS = 300;
const MAX_SAFE_PART_BYTES =90 * 1024 * 1024;
const PBKDF2_ITERATIONS = 300000;
const MAGIC = new TextEncoder().encode("MOVSENC1");
const HEADER_SIZE = 21;
let ffmpeg = null;
let ffmpegLoaded = false;
let cancelled = false;
let inputName = null;
const $ = id => document.getElementById(id);
const STORJ_REGION = "global";
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
