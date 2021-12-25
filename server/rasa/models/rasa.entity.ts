import { PrimaryGeneratedColumn, Column, OneToMany, Entity, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContainerCreateOptions } from 'dockerode';

@Entity()
export class RasaServer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-json', nullable: true })
  dockerOptions?: ContainerCreateOptions;

  @Column({ nullable: true })
  host?: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => RasaHelperServer, (helper) => helper.bot, { eager: true, cascade: true })
  helpers: RasaHelperServer[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity()
export class RasaHelperServer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'simple-json' })
  dockerOptions: ContainerCreateOptions;

  @ManyToOne(() => RasaServer, (bot) => bot.helpers)
  bot: RasaServer;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
