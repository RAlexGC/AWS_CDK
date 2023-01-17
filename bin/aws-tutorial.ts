#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StorageStack } from '../lib/storage-stack';
import { ComputeStack } from '../lib/compute-stack';

const app = new cdk.App();
const storageStack = new StorageStack(app, 'ImageStorage');
new ComputeStack(app, 'ComputeStack', {storageStack});