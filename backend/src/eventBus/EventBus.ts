import { EventEmitter } from 'events';
import { EventType, EventPayloads } from './events/types';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

class TypedEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  on<T extends EventType>(event: T, listener: (payload: EventPayloads[T]) => void | Promise<void>) {
    this.emitter.on(event, async (payload) => {
      try {
        await listener(payload);
      } catch (err) {
        logger.error(`Error in event listener for ${event}:`, err);
      }
    });
  }

  async emit<T extends EventType>(event: T, payload: EventPayloads[T], userId?: string) {
    logger.info(`📢 Event emitted: ${event}`);
    
    // Asynchronously dispatch to local listeners
    this.emitter.emit(event, payload);

    // Save event in database event store for background jobs / audits
    try {
      await prisma.domainEvent.create({
        data: {
          type: event,
          userId: userId || null,
          payload: payload as any,
          processed: true, // Mark processed initially since it was fired in-memory
          processedAt: new Date(),
        },
      });
    } catch (dbErr) {
      logger.error(`Failed to persist domain event ${event} to DB:`, dbErr);
    }
  }
}

export const EventBus = new TypedEventBus();
