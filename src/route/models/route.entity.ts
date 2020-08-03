import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RouteType } from './route.dto';

@Entity()
@Index(['sourceType', 'sourceName', 'destinationType', 'destinationName'], { unique: true })
export class Route {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'enum', enum: RouteType })
  sourceType: RouteType;

  @Index()
  @Column()
  sourceName: string;

  @Index()
  @Column({ type: 'enum', enum: RouteType })
  destinationType: RouteType;

  @Index()
  @Column()
  destinationName: string;

  @Index()
  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
