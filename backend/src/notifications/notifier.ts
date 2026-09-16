import { Injectable, Logger } from '@nestjs/common';

export const NOTIFIER = Symbol('NOTIFIER');

export type NewBookingNotice = {
  shopId: string;
  code: string;
  customerName: string;
  source: 'online' | 'walk_in';
};

export interface Notifier {
  newBooking(notice: NewBookingNotice): void;
}

@Injectable()
export class ConsoleNotifier implements Notifier {
  private readonly logger = new Logger('Notifier');

  newBooking(notice: NewBookingNotice): void {
    this.logger.log(
      `New ${notice.source} booking ${notice.code} for shop ${notice.shopId} (${notice.customerName})`,
    );
  }
}
