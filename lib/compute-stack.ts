import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StorageStack } from './storage-stack';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');

interface ComputeProps extends StackProps {
    storageStack: StorageStack;
}

export class ComputeStack extends Stack {
    constructor(scope: Construct, id: string, props: ComputeProps) {
        super(scope, id, props);

        const { mediaAssetBucket } = props.storageStack;

        const AIRTABLE_KEY = 'key8cAFa0P0VRYV9s';
        const AIRTABLE_BASE = 'appukL7T9dWa7I035';

        const handleImageUpload = new NodejsFunction(this, 'HandleImageUpload', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: path.join(__dirname, `/../lambda/mylambda.ts`),
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