import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Handler } from "aws-lambda";
import axios from "axios";
const Airtable = require("airtable");

export const handler: Handler = async (event: any): Promise<any> => {
  const bucketName = process.env.ASSETBUCKET || "";
  const apiKey = process.env.AIRTABLE_KEY;
  const baseID = process.env.AIRTABLE_BASE;

  const base = new Airtable({apiKey: apiKey}).base(baseID);

  // Deserialize the body from the event
  const info = JSON.parse(event.body);
  console.log(event);

  // Define how the image will be saved on S3
  const imageKey = `images/${info.name}.${info.extension}`;

  // Fetch the image from the provided URL using Axios
  const { data } = await axios.get(info.url, {
    responseType: "arraybuffer",
  });

  // Create a buffer from the image data
  const buf = Buffer.from(data);

  // Create the command to send the image to S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageKey,
    Body: buf,
    ACL: "public-read",
  });

  // Save the image with the s3Client
  const client = new S3Client({});
  const clientData = await client.send(command);
  const baseObjectURL = "https://imagestorage-awstutorialrgfafa2a8f-nv5mrudxh5mv.s3.amazonaws.com/"

  // Update URL field on Airtable
  await base(info.tableID).update([
    {
      "id": info.recordID,
      "fields": {
        "fldy5CHeXKcDLRSYB": baseObjectURL + imageKey,
        "fldES3LlRKuqDlxJi": info.name,
        "fldjq4QZsCPfdW4qQ": info.extension
      }
    }
  ]);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Image uploaded to S3!",
    }),
  };
};
