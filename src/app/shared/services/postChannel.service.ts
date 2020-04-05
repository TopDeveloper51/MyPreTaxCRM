// External Imports
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

// Start : PostalChannel

@Injectable({
  providedIn: 'root'
})
export class PostalChannelService {
  // Postal message to be emitted through PostalChannel, and to subscribe its message
  private postalMessageSource = new Subject<IPostal>();
  public postalMessage$ = this.postalMessageSource.asObservable();

  constructor() {}

  // Publish Postal Event, and pass message you want to broadcast
  public PublishPostalEvent(obj: IPostal): void {
    this.postalMessageSource.next(obj);
  }
}

// `data` is the data published by the publisher.
// `envelope` is a wrapper around the data & contains metadata about the message like the channel, topic,
// timestamp and any other data which might have been added by the sender.
export interface IPostal {
  channel: string;
  topic: string;
  data?: any;
  envelope: any;
}
// End : PostalChannel
