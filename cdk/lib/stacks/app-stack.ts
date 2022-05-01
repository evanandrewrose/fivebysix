import * as appsync from "@aws-cdk/aws-appsync-alpha";
import {
  AuthorizationType,
  GraphqlApi,
  MappingTemplate,
  Schema,
} from "@aws-cdk/aws-appsync-alpha";
import { AppName } from "@lib/consts";
import { paths } from "@lib/util";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as route53 from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import * as path from "path";

export class AppStack extends Stack {
  graphqlApi: GraphqlApi;
  waf: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, `${AppName}Table`, {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
    });

    this.graphqlApi = new appsync.GraphqlApi(this, `${AppName}Api`, {
      name: `${AppName}Api`,
      schema: Schema.fromAsset(`${paths.api}/schema.graphql`),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
    });

    this.waf = new wafv2.CfnWebACL(this, "waf", {
      scope: "REGIONAL",
      defaultAction: { allow: {} },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "firewall",
      },
      rules: [
        {
          name: "OneRequestEveryThreeSecondsOverFiveMinutes",
          priority: 0,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 100,
              aggregateKeyType: "IP",
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "LimitRequests100",
          },
        },
      ],
    });

    const wafAssoc = new wafv2.CfnWebACLAssociation(this, "wafAssoc", {
      resourceArn: this.graphqlApi.arn,
      webAclArn: this.waf.attrArn,
    });

    wafAssoc.node.addDependency(this.graphqlApi);

    const resolverLambda = new NodejsFunction(this, `${AppName}Api_Function`, {
      runtime: Runtime.NODEJS_14_X,
      handler: "handler",
      entry: path.resolve(paths.lambdasSource, "handler.ts"),
      timeout: Duration.seconds(30),
      functionName: `${AppName}Api_Resolver`,
      memorySize: 128,
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        API_ENDPOINT: this.graphqlApi.graphqlUrl,
        DYNAMO_TABLE: table.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        tsconfig: `${paths.lambdas}/tsconfig.prod.json`,
      },
    });

    // todo: would be cool to somehow get this from the lambdas package instead or have a single config that both
    // packages use
    const lambdaResolvers: {
      type: "Query" | "Mutation";
      field: string;
    }[] = [
      {
        type: "Query",
        field: "getGame",
      },
      {
        type: "Query",
        field: "getPlayer",
      },
      {
        type: "Query",
        field: "getGuesses",
      },
      {
        type: "Mutation",
        field: "setPlayerReady",
      },
      {
        type: "Mutation",
        field: "setPlayerName",
      },
      {
        type: "Mutation",
        field: "createGame",
      },
      {
        type: "Mutation",
        field: "createPlayer",
      },
      {
        type: "Mutation",
        field: "guess",
      },
      {
        type: "Mutation",
        field: "joinGame",
      },
    ];

    const requestMappingTemplate = `{
      "version": "2017-02-28",
      "operation": "Invoke",
      "payload": {
        "arguments": $utils.toJson($ctx.args),
        "info": {
          "fieldName": $utils.toJson($ctx.info.fieldName),
          "parentTypeName": $utils.toJson($ctx.info.parentTypeName),
          "variables": $utils.toJson($ctx.info.variables),
          "selectionSetList": $utils.toJson($ctx.info.selectionSetList)
        }
      }
    }`;

    const lambdaDataSource = this.graphqlApi.addLambdaDataSource(
      `${AppName}Api_Lambda_DataSource`,
      resolverLambda,
      {
        name: `${AppName}Api_Lambda`,
      }
    );

    lambdaResolvers.forEach(({ type, field }) => {
      this.graphqlApi.createResolver({
        fieldName: field,
        typeName: type,
        dataSource: lambdaDataSource,
        requestMappingTemplate: MappingTemplate.fromString(
          requestMappingTemplate
        ),
        responseMappingTemplate: MappingTemplate.lambdaResult(),
      });
    });

    // Create a none data source to trigger subscription updates to the game state
    this.graphqlApi.createResolver({
      fieldName: "notifyGameUpdate",
      typeName: "Mutation",
      dataSource: this.graphqlApi.addNoneDataSource("None"),
      requestMappingTemplate: MappingTemplate.fromString(
        '{"version": "2018-05-29", "payload": $util.toJson($context.args.game)}'
      ),
      responseMappingTemplate: MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });

    table.grantReadWriteData(resolverLambda);

    this.graphqlApi.grantMutation(resolverLambda);
    this.graphqlApi.grantQuery(resolverLambda);

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: "fivebysix.com",
    });

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: "fivebysix.com",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const siteCertificateArn = new acm.DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName: "fivebysix.com",
        subjectAlternativeNames: ["www.fivebysix.com"],
        hostedZone: zone,
      }
    ).certificateArn;

    const siteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        enabled: true,
        errorConfigurations: [
          // point redirects to index.html (delegate routing to react router)
          {
            errorCode: 403,
            errorCachingMinTtl: 30,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
          {
            errorCode: 404,
            errorCachingMinTtl: 30,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
          {
            errorCode: 405,
            errorCachingMinTtl: 30,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
        viewerCertificate: {
          aliases: ["fivebysix.com", "www.fivebysix.com"],
          props: {
            acmCertificateArn: siteCertificateArn,
            sslSupportMethod: "sni-only",
          },
        },
        originConfigs: [
          {
            customOriginSource: {
              domainName: siteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    new route53.ARecord(this, "SiteRecord", {
      recordName: "fivebysix.com",
      target: route53.RecordTarget.fromAlias(
        new CloudFrontTarget(siteDistribution)
      ),
      zone,
    });

    new route53.ARecord(this, "SiteRecordWww", {
      recordName: "www.fivebysix.com",
      target: route53.RecordTarget.fromAlias(
        new CloudFrontTarget(siteDistribution)
      ),
      zone,
    });

    new BucketDeployment(this, "Deployment", {
      sources: [Source.asset("../app/dist")],
      destinationBucket: siteBucket,
      distribution: siteDistribution,
      distributionPaths: ["/*"],
    });
  }
}
