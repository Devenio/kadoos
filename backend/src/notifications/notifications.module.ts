import { Module } from '@nestjs/common';
import { ConsoleNotifier, NOTIFIER } from './notifier.js';

@Module({
  providers: [{ provide: NOTIFIER, useClass: ConsoleNotifier }],
  exports: [NOTIFIER],
})
export class NotificationsModule {}
