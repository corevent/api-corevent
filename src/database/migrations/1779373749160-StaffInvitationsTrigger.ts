import { MigrationInterface, QueryRunner } from 'typeorm'

export class StaffInvitationsTrigger1779373749160 implements MigrationInterface {
  name = 'StaffInvitationsTrigger1779373749160'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION cancel_pending_staff_invitations_on_event_leave_opened()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status = 'opened'
           AND NEW.status IN ('going', 'canceled')
           AND OLD.status IS DISTINCT FROM NEW.status
        THEN
          UPDATE event_staff_invitations
          SET invitation_status = 'canceled'
          WHERE event_id = NEW.id
            AND invitation_status = 'pending';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await queryRunner.query(`
      CREATE TRIGGER trg_cancel_pending_invitations_on_event_status
      AFTER UPDATE OF status ON events
      FOR EACH ROW
      EXECUTE FUNCTION cancel_pending_staff_invitations_on_event_leave_opened();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_cancel_pending_invitations_on_event_status ON events;
    `)
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS cancel_pending_staff_invitations_on_event_leave_opened();
    `)
  }
}
