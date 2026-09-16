import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { PaymentsService } from './payments.service.js';
import {
  requestPaymentSchema,
  verifyPaymentSchema,
  type RequestPaymentBody,
  type VerifyPaymentBody,
} from './payments.schemas.js';

@Controller('payments/zarinpal')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('request')
  request(
    @Body(new ZodValidationPipe(requestPaymentSchema)) body: RequestPaymentBody,
  ) {
    return this.payments.request(body);
  }

  @Post('verify')
  verify(
    @Body(new ZodValidationPipe(verifyPaymentSchema)) body: VerifyPaymentBody,
  ) {
    return this.payments.verify(body.status, body.authority);
  }
}
