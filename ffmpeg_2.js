async function toPatchedFFmpegURL(url){
    const response = await fetch(url);
    if(!response.ok){
        throw new Error("تعذر تحميل ffmpeg.js\nHTTP " +response.status);
    }
    let source = await response.text();
    const target = "new URL(e.p+e.u(814),e.b)";
    if(source.includes(target)){
        source =source.replace(target,"r.workerLoadURL");
    }
    return URL.createObjectURL(new Blob([source],{type:"text/javascript"}));
}
async function loadFF(){
    if(ffmpegLoaded){
        return;
    }
    if(!window.crossOriginIsolated){
        throw new Error("crossOriginIsolated=false.\n\n" ,"تأكد من وجود ملفات Service Worker " );
    }
    const ffmpegBase ="https://unpkg.com/" +"@ffmpeg/ffmpeg@0.12.15/dist/umd";
    const coreBase ="https://unpkg.com/" +"@ffmpeg/core-mt@0.12.10/dist/umd";
    setStatus("⏳ تحميل FFmpeg JS...");
    const ffmpegBlobURL = await toPatchedFFmpegURL(ffmpegBase +"/ffmpeg.js");
    await import(ffmpegBlobURL);
    if(!window.FFmpegWASM ||!window.FFmpegWASM.FFmpeg){
        throw new Error("تعذر إنشاء FFmpegWASM.FFmpeg.");
    }
    ffmpeg = new window.FFmpegWASM.FFmpeg();
    ffmpeg.on("log",({message}) => {
        console.debug("[FFmpeg]",message);
    });
    ffmpeg.on("progress",({progress}) => {
        if(typeof progress ==="number"){
            window.ffmpegProgress = progress;
        }
    });
    setStatus("⏳ تحميل FFmpeg Core...\n" +"قد يستغرق ذلك بعض الوقت أول مرة.");
    await ffmpeg.load({
        workerLoadURL:await toBlobURL(ffmpegBase +"/814.ffmpeg.js","text/javascript"),
        coreURL: await toBlobURL(coreBase +"/ffmpeg-core.js","text/javascript"),
        wasmURL: await toBlobURL(coreBase +"/ffmpeg-core.wasm","application/wasm"),
        workerURL: await toBlobURL(coreBase +"/ffmpeg-core.worker.js","application/javascript")
    });
    ffmpegLoaded = true;
    setStatus("✅ تم تحميل FFmpeg بنجاح.");
}
async function extractPart(startSeconds,durationSeconds,outputName){
    checkCancelled();
    try{
        await ffmpeg.deleteFile(outputName);
    }catch{}
    const returnCode = await ffmpeg.exec(["-ss",String(startSeconds),"-i",inputName,"-t",String(durationSeconds),"-map","0","-c","copy","-movflags","+faststart","-avoid_negative_ts","make_zero",outputName]);
    if(returnCode !== 0){
        throw new Error("FFmpeg فشل في استخراج " +outputName);
    }
    const data = await ffmpeg.readFile(outputName);
    if(!data ||!data.length){
        throw new Error("الجزء الناتج فارغ.");
    }
    return data;
}