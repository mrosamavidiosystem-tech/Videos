function isUUID(value){
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function deriveKey(uuid,salt){
    const passwordKey = await crypto.subtle.importKey("raw",new TextEncoder().encode(uuid),{name:"PBKDF2"},false,["deriveKey"]);
    return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:PBKDF2_ITERATIONS,hash:"SHA-256"},passwordKey,{name:"AES-GCM",length:256},false,["encrypt"]);
}

async function toBase64(bytes) {
    const blob = new Blob([bytes]);
    return new Promise((resolve, reject) => {
        const reader =new FileReader();
        reader.onload = () => {
            const result = String(reader.result);
            const comma = result.indexOf(",");
            if (comma < 0) {
                reject( new Error("FAIL Base64.") );
                return;
            }
            resolve( result.slice(comma + 1));
        };
        reader.onerror = () => {
            reject( reader.error ||new Error("FileReader failed."));
        };
        reader.readAsDataURL(blob);
        }
    );
}
async function encryptPart(rawBytes,key,videoId,partIndex){
    const iv =crypto.getRandomValues(new Uint8Array(12));
    const additionalData =new TextEncoder().encode(videoId +":part:" +partIndex);
    const encrypted =await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData,tagLength:128},key,rawBytes);
    const cipher =new Uint8Array(encrypted);
    const output =new Uint8Array(HEADER_SIZE +cipher.length);
    output.set( MAGIC,0 );
    output[8] = 1;
    output.set(iv,9);
    output.set(cipher,HEADER_SIZE);
    return output;
}

async function sha256Hex(bytes) {
    const digest = await crypto.subtle.digest("SHA-256",bytes);
    return Array.from(new Uint8Array(digest)).map(x =>x.toString(16).padStart(2, "0")).join("");
}
