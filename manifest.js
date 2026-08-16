async function createManifest(data){
    const manifest = {
        version: 1,
        createdAt: new Date().toISOString(),
        videoId: data.videoId,
        originalName: data.originalName,
        duration: data.duration,
        totalParts: data.totalParts,
        salt: Array.from(data.salt),
        algorithm: "AES-256-GCM",
        pbkdf2Iterations: PBKDF2_ITERATIONS,
        partSeconds: PART_SECONDS,
        magic: "MOVSENC1",
        parts: data.parts
    };
    const json = JSON.stringify(manifest,null,2);
    const bytes = new TextEncoder().encode(json);
    const manifestName = `${data.videoId}/manifest.json`;
    await uploadToStorj(manifestName,bytes,"application/json");
    console.log("Manifest Uploaded:",storjURL(manifestName));
    return {manifest,url: storjURL(manifestName)};
}