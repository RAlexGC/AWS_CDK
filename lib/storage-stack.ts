import * as s3 from "aws-cdk-lib/aws-s3";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class StorageStack extends Stack {
  private assetBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.assetBucket = new s3.Bucket(this, "aws-tutorial-rg", {
      versioned: false,
      publicReadAccess: false,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ["*"],
        },
      ],
    });
  }

  get mediaAssetBucket() {
    return this.assetBucket;
  }
}
