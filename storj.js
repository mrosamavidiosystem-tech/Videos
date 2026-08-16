AWS.config.update({
    accessKeyId: STORJ_ACCESS_KEY,
    secretAccessKey: STORJ_SECRET_KEY,
    region: STORJ_REGION
});
const s3 = new AWS.S3({
    endpoint: STORJ_ENDPOINT,
    s3ForcePathStyle: true,
    signatureVersion: "v4"
});
async function uploadToStorj(key, bytes, contentType){
    checkCancelled();
    await s3.putObject({
        Bucket: STORJ_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType
    }).promise();
}
function storjURL(key){
    return (STORJ_ENDPOINT +"/" +STORJ_BUCKET +"/" +key);
}
async function objectExists(key){
    try{
        await s3.headObject({
            Bucket: STORJ_BUCKET,
            Key: key
        }).promise();
        return true;
    }
    catch(err){
        if(err.statusCode === 404 ||err.code === "NotFound"){
            return false;
        }
        throw err;
    }
}