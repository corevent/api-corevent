import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { Cities } from '~/modules/cities/cities.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { Events } from '~/modules/events-module/events.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { States } from '~/modules/states/states.entity'
import { Users } from '~/modules/users/users.entity'

export const entities = [Users, RefreshTokens, OrganizerPaymentInfo, States, Cities, Events, EventChanges]
