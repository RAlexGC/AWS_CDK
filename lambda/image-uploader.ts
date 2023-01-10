import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const handler = async (event: any): Promise<any> => {
  const bucketName = process.env.ASSETBUCKET || "";
  // Deserialize the body from the event
  const info = JSON.parse(event.body);
  // Define how the image will be saved on S3
  const imageKey = `images/${info.name}.${info.extension}`;
  // Create a buffer from the image data
  const buf = Buffer.from(info.imageData, "base64");
  // Create the command to send the image to S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageKey,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: info.imageType,
    ACL: "public-read",
  });

  // Save the image with the s3Client
  const client = new S3Client({});
  await client.send(command);
};
