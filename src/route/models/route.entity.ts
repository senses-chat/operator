import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RouteDefinition } from './route.dto';

@Entity()
export class Route {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'simple-json' })
  definition: RouteDefinition;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
