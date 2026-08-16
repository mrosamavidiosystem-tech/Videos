async function startUpload() {
    try {
        cancelled = false;
        $("cancel").disabled = false;
        $("start").disabled = true;
        setProgress(0);
        const uuid = $("uuid").value.trim();
        if (!isUUID(uuid)) {
            throw new Error("UUID غير صحيح.");
        }
        const file = $("video").files[0];
        if (!file) {
            throw new Error("اختر فيديو أولاً.");
        }
        setStatus("⏳ تحميل FFmpeg...");
        await loadFF();
        setStatus("✅ FFmpeg جاهز.");
        setStatus("⏳ قراءة بيانات الفيديو...");
        const duration = await getVideoDuration(file);
        const totalParts = Math.ceil(duration / PART_SECONDS);
        const videoId = uuid;
        const salt = new TextEncoder().encode(uuid);
        const key = await deriveKey(uuid, salt);
        setStatus( `مدة الفيديو : ${hms(duration)}عدد الأجزاء : ${totalParts}جارى البدء...`);
        console.log({ duration, totalParts, videoId, salt });
        setStatus("⏳ تجهيز الفيديو...");
        inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
        try {
            await ffmpeg.deleteFile(inputName);
        } catch { }
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        setStatus("⏳ استخراج أول جزء...");
        const manifestParts = [];
        for (let partIndex = 0; partIndex < totalParts; partIndex++) {
            setProgress(((partIndex+1) / totalParts) * 100);
            setStatus(`⏳ الجزء ${partIndex + 1} من ${totalParts}`);
            const start = partIndex * PART_SECONDS;
            const partDuration = Math.min(PART_SECONDS, duration - start);
            const outputName = `part${partIndex}.mp4`;
            const part = await extractPart(start, partDuration, outputName);
            console.log("First Part Size:", human(part.length));
            setStatus("✅ تم استخراج أول جزء.\n\nالحجم : " + human(part.length));
            setStatus(`🔐 تشفير الجزء ${partIndex + 1}...`);
            const encryptedPart = await encryptPart(part, key, videoId, partIndex);
            console.log("Encrypted Size:", human(encryptedPart.length));
            const partHash = await sha256Hex(encryptedPart);
            console.log("SHA256:", partHash);
            setStatus(`✅ تم تشفير أول جزء.الحجم قبل التشفير : ${human(part.length)}الحجم بعد التشفير : ${human(encryptedPart.length)}SHA256${partHash}`);
            setStatus("☁️ رفع أول جزء إلى Storj...");
            const partName = `${videoId}/part${String(partIndex).padStart(4, "0")}.movs`;
            if(await objectExists(partName)){
                console.log("Skipped:",partName);
            }else{
                await uploadToStorj(partName,encryptedPart,"application/octet-stream");
            }
            manifestParts.push({
                index: partIndex,
                file: partName,
                url: storjURL(partName),
                size: encryptedPart.length,
                sha256: partHash
            });
            console.log("Uploaded:", storjURL(partName));
            setStatus(`✅ تم رفع أول جزء بنجاح.${storjURL(partName)}`);
        }
        const manifestInfo = await createManifest({
            videoId,
            originalName: file.name,
            duration,
            totalParts,
            salt,
            parts: manifestParts
        });
        setProgress(100);
        setStatus(`🎉 اكتمل رفع الفيديو بنجاح.Video ID:${videoId}Manifest:${manifestInfo.url}عدد الأجزاء:${totalParts}`);
    }
    catch (err) {
        console.error(err);
        setStatus(err.message);
    }
    finally {
        $("cancel").disabled = true;
        $("start").disabled = false;
    }
}