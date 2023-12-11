import { app } from '@azure/functions';
import main from '../index.js'

app.timer('HealthCheck', {
    schedule: '0 */45 * * * *',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request at', new Date().toISOString());
        context.log('Timer status:', myTimer);
        await main(context);
    }
});
