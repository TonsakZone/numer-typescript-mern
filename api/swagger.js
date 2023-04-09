const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./endpoints.js']
const securityDefinitions = {
    basicAuth: {
      type: 'basic',
    },
    apiKey: {
      type: 'apiKey',
      name: 'authorization',
      in: 'header',
    },
  };
  
  const doc = {
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    securityDefinitions: securityDefinitions,
  };

swaggerAutogen(outputFile, endpointsFiles, doc);