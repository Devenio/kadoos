import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { ZARINPAL_GATEWAY } from './zarinpal.gateway.js';
import { ZarinPalSdkGateway } from './zarinpal.sdk.js';

@Module({
  imports: [AppointmentsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: ZARINPAL_GATEWAY,
      useClass: ZarinPalSdkGateway,
    },
  ],
})
export class PaymentsModule {}
