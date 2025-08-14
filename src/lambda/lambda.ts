import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Handler } from 'aws-lambda';
import { createApp } from 'src/lambda/lambda-bootstrap';

let server: Handler<any, void>;

export const handler: Handler = async (event, context, callback) => {
  if (!server) {
    const app = await createApp();
    server = serverlessExpress({ app });
  }
  return server(event, context, callback);
};
