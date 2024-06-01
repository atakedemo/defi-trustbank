#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsWebappHostStack } from '../lib/aws_webapp_host-stack';

const app = new cdk.App();
new AwsWebappHostStack(app, 'AwsWebappHostStack', {

});