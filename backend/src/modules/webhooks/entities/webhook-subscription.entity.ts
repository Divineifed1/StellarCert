import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeiorm';
import { User } from '../../users/entities/user.entity';
import { WebhookLog } from './webhook-log.entity';

export enum WebhookEvent {
  CERTIFICATE_ISSUDE = 'certificate.issued',
  CERTIFICATE_REVOKED = 'certificate.revoked',
  CERTIFICATE_VERIFIED = 'certificate.verified',
  CERTIFICATE_EXPIRED = 'certificate.expired',
  CERTIFICATE_FROZEN = 'certificate.frozen',
  CERTIFICATE_UNFROZEN = 'certificate.unfrozen',
  WEBHOOK_TEST = 'webhook.test',
}

@Entity('webhook_subscriptions')
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Owner of the subscription. This is the authenticated user's id (as
   * stored by the controller), so the relation and FK must point at
   * `users` -- consistent with `certificates.issuerId`.
   */
  @Column()
  issuerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issuerId' })
  issuer: User;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: WebhookEvent,
    array: true,
    default: [],
  })
  events: WebhookEvent[];

  /**
   * HMAC signing secret. Never expose after create (#719).
   * API responses use {@link sanitizeSubscription} which strips this field.
   */
  @Column()
  secret: string;

  /**
   * SHA-256 hash of the secret for storage integrity checks.
   * Not a substitute for the secret used in HMAC delivery.
   */
  @Column({ nullable: true })
  secretHash?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => WebhookLog, (log) => log.subscription)
  logs: WebhookLog[];
}
