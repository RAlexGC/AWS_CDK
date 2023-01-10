import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StorageStack } from './storage-stack';

interface ComputeProps extends StackProps {
    storageStack: StorageStack;
}

export class ComputeStack extends Stack {
    constructor(scope: Construct, id: string, props: ComputeProps) {
        super(scope, id, props);

        const { mediaAssetBucket } = props.storageStack;

        const AIRTABLE_KEY = 'KEY';
        const AIRTABLE_BASE = 'appukL7T9dWa7I035';

        const handleImageUpload = new lambda.Function(this, 'HandleImageUpload', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'image-uploader.handler',
            code: lambda.Code.fromAsset('lambda'),
            memorySize: 512,
            timeout: Duration.minutes(15),
            environment: {
                AIRTABLE_BASE,
                AIRTABLE_KEY,
                ASSETBUCKET: mediaAssetBucket.bucketName
            }
        });

        handleImageUpload.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: ["*"],
                allowedHeaders: ["*"]
            }
        });

        mediaAssetBucket.grantReadWrite(handleImageUpload);
        mediaAssetBucket.grantPutAcl(handleImageUpload);

    }
}