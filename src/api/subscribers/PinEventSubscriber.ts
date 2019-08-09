import { EventSubscriber, On } from 'event-dispatch';
import Container from 'typedi';

import { AuthSender } from '../../mail/AuthSender';
import { events, PinIssuedEvent } from './events';

@EventSubscriber()
export class PinEventSubscriber {

    @On(events.pin.issued)
    public onPinIssued(pinEvent: PinIssuedEvent): void {
        Container.get(AuthSender).sendPIN(pinEvent);
    }

}