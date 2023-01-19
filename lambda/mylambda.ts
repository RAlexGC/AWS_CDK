import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Handler } from "aws-lambda";
import axios from "axios";
const Airtable = require("airtable");

export const handler: Handler = async (event: any): Promise<any> => {
  const bucketName = process.env.ASSETBUCKET || "";
  const apiKey = process.env.AIRTABLE_KEY;
  const baseID = process.env.AIRTABLE_BASE;
  let base;
  try {
    base = new Airtable({ apiKey: apiKey }).base(baseID);
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Airtable error",
        error: e.name,
      }),
    };
  }
  let info;
  try {
    // Deserialize the body from the event
    info = JSON.parse(event.body);
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "JSON body error",
        error: e.name,
      }),
    };
  }
  // Define how the image will be saved on S3
  const imageKey = `images/${info.name}.${info.extension}`;
  let response;
  try {
    // Fetch the image from the provided URL using Axios
    response = await axios.get(info.url, {
      responseType: "arraybuffer",
    });
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Axios error",
        error: e.name,
      }),
    };
  }
  const data = response.data;
  // Create a buffer from the image data
  const buf = Buffer.from(data);
  // Create the command to send the image to S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageKey,
    Body: buf,
    ACL: "public-read",
  });
  let baseObjectURL;
  try {
    // Save the image with the s3Client
    const client = new S3Client({});
    const clientData = await client.send(command);
    baseObjectURL =
      "https://imagestorage-awstutorialrgfafa2a8f-nv5mrudxh5mv.s3.amazonaws.com/";
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "S3 Client error",
        error: e.name,
      }),
    };
  }
  try {
    // Update URL field on Airtable
    await base(info.tableID).update([
      {
        id: info.recordID,
        fields: {
          fldy5CHeXKcDLRSYB: baseObjectURL + imageKey,
          fldES3LlRKuqDlxJi: info.name,
          fldjq4QZsCPfdW4qQ: info.extension,
        },
      },
    ]);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image uploaded to S3!",
      }),
    };
  } catch (e: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Airtable error",
        error: e.name,
      }),
    };
  }
};
