import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { stringify } from 'yaml';
import fs from 'fs';

interface SwaggerGeneratorOptions {
  title?: string;
  version?: string;
  outputFile?: string;
}

export class SwaggerGenerator {
  private app: Express;
  private title: string;
  private version: string;
  private outputFile: string | null;

  constructor(app: Express, options: SwaggerGeneratorOptions = {}) {
    this.app = app;
    this.title = options.title || 'API Documentation';
    this.version = options.version || '1.0.0';
    this.outputFile = options.outputFile || null;
  }

  private getRoutes() {
    const routes: { path: string; methods: string[] }[] = [];

    const processStack = (stack: any[], basePath = '') => {
      stack.forEach((middleware) => {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods).map((m) =>
            m.toUpperCase(),
          );
          routes.push({ path: basePath + middleware.route.path, methods });
        } else if (middleware.name === 'router' && middleware.handle?.stack) {
          const newBase =
            middleware.regexp && middleware.regexp.fast_slash
              ? basePath
              : basePath +
                (middleware.regexp?.source
                  ?.replace('^\\/', '/')
                  ?.replace('\\/?(?=\\/|$)', '')
                  ?.replace(/\\\//g, '/')
                  ?.replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param') || '');

          processStack(middleware.handle.stack, newBase);
        }
      });
    };

    processStack(this.app._router.stack);
    return routes;
  }

  private generateSpec() {
    const paths: Record<string, any> = {};
    const routes = this.getRoutes();

    routes.forEach(({ path, methods }) => {
      if (!paths[path]) paths[path] = {};

      const match = path.match(/^\/api\/([^\/]+)/);
      const tag = match ? match[1] : 'other';

      methods.forEach((method) => {
        paths[path][method.toLowerCase()] = {
          tags: [tag],
          summary: `${method} ${path}`,
          responses: {
            200: {
              description: 'Successful response',
            },
          },
        };
      });
    });

    const spec = {
      openapi: '3.0.0',
      info: {
        title: this.title,
        version: this.version,
      },
      paths,
      tags: this.generateTags(routes),
    };

    return spec;
  }

  private generateTags(routes: { path: string; methods: string[] }[]) {
    const tagsSet = new Set<string>();

    routes.forEach(({ path }) => {
      const match = path.match(/^\/api\/([^\/]+)/);
      const tag = match ? match[1] : 'other';
      tagsSet.add(tag);
    });

    return Array.from(tagsSet).map((tag) => ({
      name: tag,
      description: `${tag} related endpoints`,
    }));
  }

  public serveDocs(route = '/docs') {
    const spec = this.generateSpec();
    if (this.outputFile) {
      const yamlStr = stringify(spec);
      fs.writeFileSync(this.outputFile, yamlStr, 'utf8');
      console.log(`Swagger spec written to ${this.outputFile}`);
    }
    this.app.use(route, swaggerUi.serve, swaggerUi.setup(spec));
    console.log(`Swagger UI available at ${route}`);
  }
}
