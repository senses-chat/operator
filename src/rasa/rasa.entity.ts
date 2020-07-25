import { PrimaryGeneratedColumn, Column, OneToMany, Entity, ManyToOne } from 'typeorm';
import { ContainerCreateOptions } from 'dockerode';

@Entity()
export class RasaBot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-json' })
  dockerOptions: ContainerCreateOptions;

  @Column({ type: 'int' })
  port: number;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => RasaService, service => service.bot, { eager: true, cascade: true })
  services: RasaService[];
}

@Entity()
export class RasaService {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'simple-json' })
  dockerOptions: ContainerCreateOptions;

  @ManyToOne(() => RasaBot, bot => bot.services)
  bot: RasaBot;
}
