# AWS Static Site Deploy Setup

This repo now uses GitHub Actions OIDC to assume a short-lived AWS role at deploy time.

That means:

- No long-lived AWS access keys in GitHub
- A role limited to one S3 bucket
- Deploys only from this repository's `master` branch workflow

This matches the current hosting setup:

- Region: `us-east-1`
- Bucket: `yellow-hellow-website`
- Deployment target: `dist/voice-agent-website/browser`

## 1. Create the IAM identity provider

If you do not already have it, create the GitHub OIDC provider in AWS IAM:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

## 2. Create the deploy role trust policy

Replace:

- `AWS_ACCOUNT_ID` with your AWS account ID

Use this trust policy for the deploy role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:akshaygoyal992/voice-agent-website:ref:refs/heads/master"
        }
      }
    }
  ]
}
```

If you want manual deploys from other branches later, expand the `sub` condition intentionally instead of using a wildcard now.

## 3. Attach a minimal permissions policy

Replace:

- `YOUR_BUCKET_NAME` with your S3 bucket name

Attach this inline policy to the deploy role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListDeploymentBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    },
    {
      "Sid": "ManageStaticSiteObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

This is intentionally narrow:

- It can deploy only to one bucket
- It cannot create buckets, edit IAM, or manage other AWS resources

## 4. Add GitHub repository settings

Add this GitHub Actions secret:

- `AWS_DEPLOY_ROLE_ARN`

Add these GitHub Actions repository variables:

- `AWS_REGION`
- `S3_BUCKET`

Example values:

- `AWS_DEPLOY_ROLE_ARN=arn:aws:iam::123456789012:role/github-static-site-deploy`
- `AWS_REGION=us-east-1`
- `S3_BUCKET=yellow-hellow-website`

## 5. How the workflow works

The deploy workflow now:

1. Builds the Angular app
2. Assumes the AWS role using GitHub OIDC
3. Syncs `dist/voice-agent-website/browser` to S3

## 6. Optional hardening

If you want this even tighter, you can also:

- Put the deploy job behind a GitHub Environment with required reviewers
- Restrict the trust policy to a specific workflow file using additional OIDC conditions
- Use a dedicated deployment bucket only for this site

## 7. AWS CLI commands to create the role

Replace `AWS_ACCOUNT_ID` below before running these.

Create the role:

```bash
aws iam create-role \
  --role-name github-static-site-deploy \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:akshaygoyal992/voice-agent-website:ref:refs/heads/master"
          }
        }
      }
    ]
  }'
```

Attach the inline permissions policy:

```bash
aws iam put-role-policy \
  --role-name github-static-site-deploy \
  --policy-name github-static-site-s3-deploy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ListDeploymentBucket",
        "Effect": "Allow",
        "Action": [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ],
        "Resource": "arn:aws:s3:::yellow-hellow-website"
      },
      {
        "Sid": "ManageStaticSiteObjects",
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject"
        ],
        "Resource": "arn:aws:s3:::yellow-hellow-website/*"
      }
    ]
  }'
```

Get the role ARN for GitHub:

```bash
aws iam get-role \
  --role-name github-static-site-deploy \
  --query 'Role.Arn' \
  --output text
```

## 8. What GitHub actually needs

With OIDC, GitHub does not need AWS access keys.

Add only:

- GitHub secret: `AWS_DEPLOY_ROLE_ARN`
- GitHub variable: `AWS_REGION=us-east-1`
- GitHub variable: `S3_BUCKET=yellow-hellow-website`

Optional:

- GitHub secret: `LOGIN_URL` if you want the production build to inject a non-default login URL
