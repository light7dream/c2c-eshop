let OSS = require("ali-oss");

/**
 * oss上传文件
 * @param {*} file 
 * @param {*} sts 
 * @returns 
 */
export async function uplaodImage(file, sts) {

    //使用STS临时授权数据初始化OSS对象
    let client = new OSS({
        accessKeyId: sts.accessKeyId,
        accessKeySecret: sts.accessKeySecret,
        stsToken: sts.stsToken,
        region: sts.region,
        bucket: sts.bucket,
    });

    let result = await client.put(sts.filepath, file);
    return result;
}

