#!/usr/bin/env bash

aws cloudformation package \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.palringo.aws
    
aws cloudformation deploy \
    --template-file cf-deploy.yaml \
    --stack-name content-search-lambda \
    --capabilities CAPABILITY_IAM
