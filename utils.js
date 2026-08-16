function human(bytes){
    const units = ["B","KB","MB","GB","TB"];
    let index = 0;
    let value = bytes;
    while(value >= 1024 &&index < units.length - 1){
        value /= 1024;
        index++;
    }
    return (value.toFixed(value >= 100 ? 0 : 2) +" " +units[index]);
}
function hms(seconds){
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return ((h? String(h).padStart(2,"0") + ":": "") +String(m).padStart(2,"0") +":" +String(s).padStart(2,"0"));
}
function checkCancelled(){
    if(cancelled){
        throw new Error("تم إلغاء العملية.");
    }
}
async function getVideoDuration(file){
    return new Promise(
        (resolve,reject)=>{

            const video = document.createElement("video");
            const objectURL = URL.createObjectURL( file );
            video.preload = "metadata";

            video.onloadedmetadata = () => {
                const duration = video.duration;
                URL.revokeObjectURL(objectURL);
                video.remove();
                if(Number.isFinite(duration) &&duration > 0){
                    resolve(duration);
                }else{
                    reject(new Error("تعذر معرفة مدة الفيديو."));
                }
            };
            video.onerror = () => {
                URL.revokeObjectURL(objectURL);
                video.remove();
                reject(new Error("تعذر قراءة الفيديو."));
            };
            video.src = objectURL;
        }
    );
}
async function toBlobURL(url,mimeType){
    const response = await fetch(url);
    if(!response.ok){
        throw new Error("تعذر تحميل:\n" +url +"\nHTTP " +response.status);
    }
    const buffer = await response.arrayBuffer();
    return URL.createObjectURL(new Blob([buffer],{type:mimeType}));
}
