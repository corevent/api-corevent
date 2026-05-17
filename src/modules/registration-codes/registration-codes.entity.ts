import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class RegistrationCodes {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  email: string

  @Column({ type: 'text' })
  codeHash: string

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date

  @Column({ type: 'boolean', default: false })
  used: boolean

  @Column({ type: 'int', default: 0 })
  attempts: number

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date
}
