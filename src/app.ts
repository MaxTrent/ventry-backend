import express from 'express';
import bootstrap from './startup/bootstrap';
import registerRoutes from './startup/register.routes';
import { registerErrorHandlers } from './middleware/error.middleware';

const app = express();

bootstrap(app);
registerRoutes(app);
registerErrorHandlers(app);

export default app;