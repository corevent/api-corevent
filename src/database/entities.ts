import { RefreshTokens } from '~/auth/refresh-tokens.entity'
import { OrganizerPaymentInfo } from '~/organizer-payment-info/organizer-payment-info.entity'
import { Users } from '~/users/users.entity'

export const entities = [Users, RefreshTokens, OrganizerPaymentInfo]
