import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
// import * as acm from "aws-cdk-lib/aws-certificatemanager";
// import * as route53 from "aws-cdk-lib/aws-route53";
// import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

export class AwsWebappHostStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const originDomainName = "example.com";
    // const domainName = `hello.${originDomainName}`;

    // const trustBankWebHostedZone = route53.HostedZone.fromLookup(this, "TrustBankWebZone", {
    //   domainName: originDomainName,
    // });

    // const trustBankWebCertificate = new acm.Certificate(this, "trustBankWebSiteCert", {
    //   domainName,
    //   validation: acm.CertificateValidation.fromDns(trustBankWebHostedZone),
    // });

    const accessLogsBucket = new s3.Bucket(this, "AccessLogsBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const trustBankWebBucket = new s3.Bucket(this, "TrustBankWebBucket", {
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: "logs",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });
    const cloudfrontOai = new cloudfront.OriginAccessIdentity(
      this,
      "CloudFrontOAI",
      {
        comment: 'website-distribution-originAccessIdentity',
      }
    );

    const bucketPolicy = new s3.BucketPolicy(this, "WebsiteBucketPolicy", {
      bucket: trustBankWebBucket,
    });
    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOai.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
        resources: [`${trustBankWebBucket.bucketArn}/*`],
      }),
    );

    const script: string = `
      function handler(event) {
        var request = event.request;
        var uri = request.uri;

        // Check whether the URI is missing a file name.
        if (uri.endsWith('/')) {
            request.uri += 'index.html';
        }
        // Check whether the URI is missing a file extension.
        else if (!uri.includes('.')) {
            request.uri += '/index.html';
        }

        return request;
      }
    `;

    const cfFunction = new cloudfront.Function(this, "Function", {
      code: cloudfront.FunctionCode.fromInline(script),
    });
    const distribution = new cloudfront.Distribution(this, "trustBankWebDist", {
      defaultBehavior: {
        origin: new origins.S3Origin(trustBankWebBucket, {
          originAccessIdentity: cloudfrontOai
        }),
        functionAssociations: [
          {
            function: cfFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // domainNames: [`${domainName}`],
      // certificate: trustBankWebCertificate,
    });
    // new route53.ARecord(this, "cdnRecord", {
    //   zone: trustBankWebHostedZone,
    //   target: route53.RecordTarget.fromAlias(
    //     new route53Targets.CloudFrontTarget(distribution),
    //   ),
    //   recordName: domainName,
    // });

    // IAM Role for Github Actions
    const accountId = this.account;
    const region = this.region;
    const user = 'atakedemo';
    const repo = 'defi-trustbank';
    const branch = 'main';
    const oidcProvider = new iam.OpenIdConnectProvider(
      this,
      'GitHubOIDCProvider',
      {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
      }
    );
    const oidcDeployRole = new iam.Role(this, 'GitHubOidcRole', {
      roleName: 'github-oidc-role',
      assumedBy: new iam.FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${user}/${repo}:ref:refs/heads/${branch}`,
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });
    const deployToS3Policy = new iam.Policy(this, 'deployToS3Policy', {
      policyName: 'deployPolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:*'],
          resources: [
            `arn:aws:s3:::${trustBankWebBucket.bucketName}`,
            `arn:aws:s3:::${trustBankWebBucket.bucketName}/*`,
          ],
        }),
      ],
    });
    oidcDeployRole.attachInlinePolicy(deployToS3Policy);
    const clearCloudFrontCache = new iam.Policy(this, 'clearCloudFrontCache', {
      policyName: 'deleteCachePolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudfront:GetDistribution',
            'cloudfront:GetDistributionConfig',
            'cloudfront:ListDistributions',
            'cloudfront:ListStreamingDistributions',
            'cloudfront:CreateInvalidation',
            'cloudfront:ListInvalidations',
            'cloudfront:GetInvalidation'
          ],
          resources: [
            `arn:aws:cloudfront::${accountId}:distribution/${distribution.distributionId}`,
          ],
        }),
      ],
    });
    oidcDeployRole.attachInlinePolicy(clearCloudFrontCache);
  }
}
