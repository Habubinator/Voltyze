import swaggerjsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { SWAGGER_OPTIONS, IS_PRODUCTION } from '@common/constants';
import type { Express } from 'express';

export function useSwagger(route: string, app: Express) {
  if (!IS_PRODUCTION) {
    const swaggerDocs = swaggerjsdoc(SWAGGER_OPTIONS);
    app.use(route, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }
}
