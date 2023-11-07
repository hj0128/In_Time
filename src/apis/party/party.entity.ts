import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Party {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  members: string;

  @Column({ default: 0 })
  point: number;
}
