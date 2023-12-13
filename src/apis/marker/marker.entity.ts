import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from '../party/party.entity';

@Entity()
export class Marker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  lat: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  lng: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Party, (party) => party.markers, { onDelete: 'CASCADE' })
  party: Party;
}
