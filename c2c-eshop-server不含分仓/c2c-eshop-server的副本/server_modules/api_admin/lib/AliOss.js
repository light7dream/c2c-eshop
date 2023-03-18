let OSS = require('ali-oss');
class AliOss {
    constructor(param) {
        this.accessKeyId = param.accessKeyId;
        this.accessKeySecret = param.accessKeySecret;
        this.rolearn = param.rolearn;
        this.region = param.region;
        this.endpoint = param.endpoint;
        this.bucket = param.bucket;
    }

    async CreateSTS(filepath, policy, expiration, sessionName, callback) {
        try {
            let sts = new OSS.STS({ accessKeyId: this.accessKeyId, accessKeySecret: this.accessKeySecret });
            policy = JSON.stringify(policy);
            let token = await sts.assumeRole(this.rolearn, policy, expiration, sessionName);
            let client = new OSS({
                region: this.region,
                accessKeyId: token.credentials.AccessKeyId,
                accessKeySecret: token.credentials.AccessKeySecret,
                stsToken: token.credentials.SecurityToken,
                bucket: this.bucket,
                refreshSTSTokenInterval: 600000,
                refreshSTSToken: (accessKeyId, accessKeySecret, stsToken) => {
                    // 不设置会出提示日志,此处过滤掉日志
                }
            });
            let res = {};
            res.region = this.region;
            res.endpoint = this.endpoint;
            res.bucket = client.options.bucket;
            res.accessKeyId = client.options.accessKeyId;
            res.accessKeySecret = client.options.accessKeySecret;
            res.stsToken = client.options.stsToken;
            res.filepath = filepath;
            callback(res);
        } catch (e) {
            console.log(e);
            callback(null);
        }
    }

    async GetWriteSTS(filepath, expiration, sessionName, callback) {
        let policy = {
            Statement: [{
                Action: [
                    "oss:PutObject",
                    "oss:ListParts",
                    "oss:AbortMultipartUpload"
                ],
                Effect: "Allow",
                Resource: ["acs:oss:*:*:" + this.bucket + "/" + filepath]
            }],
            Version: "1"
        };
        this.CreateSTS(filepath, policy, expiration, sessionName, callback);
    }

    async GetReadSTS(filepath, expiration, sessionName, callback) {
        let policy = {
            Statement: [{
                Action: [
                    "oss:GetObject",
                    "oss:ListParts"
                ],
                Effect: "Allow",
                Resource: ["acs:oss:*:*:" + this.bucket + "/" + filepath]
            }],
            Version: "1"
        };
        this.CreateSTS(filepath, policy, expiration, sessionName, callback);
    }

}
module.exports = AliOss;