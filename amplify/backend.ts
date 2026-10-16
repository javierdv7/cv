import { defineBackend } from "@aws-amplify/backend";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({ auth, storage });

// Nobody signs themselves up: admins are created by hand.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

// Public, cached read access to the gallery bucket. The bucket itself stays
// private; CloudFront reads it through Origin Access Control.
const bucket = backend.storage.resources.bucket;
const cdn = new cloudfront.Distribution(backend.storage.stack, "GalleryCdn", {
  comment: "vargastorres.cv/photos media",
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    // Honors the Cache-Control each object is uploaded with: media caches
    // for a day, the manifest is no-cache so uploads/deletes show at once.
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
  },
  priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
});

backend.addOutput({
  custom: {
    galleryUrl: `https://${cdn.distributionDomainName}`,
  },
});
