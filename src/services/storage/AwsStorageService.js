const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class AwsStorageService {
  constructor() {
    this._client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async writeFile({ file, meta, basePathLocation }) {
    const bucket = process.env.AWS_BUCKET_NAME;
    const key = meta.filename;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    });

    await this._client.send(command);

    return this.createPresignedUrl({ bucket, key });
  }

  createPresignedUrl({ bucket, key }) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this._client, command, { expiresIn: 3600 });
  }
}

module.exports = { AwsStorageService };
