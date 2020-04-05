/** External import */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from "ag-grid-angular";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgSelectModule } from '@ng-select/ng-select';
/** Internal import */
import { ChatHistoryComponent } from '@app/chat/dialog/chat-history/chat-history.component';
import { ChatService } from '@app/chat/chat.service';
import { MessageHistoryComponent } from '@app/chat/dialog/message-history/message-history.component';
import { ChatComponent } from '@app/chat/components/chat/chat.component';
import { CustomerChatDetailComponent } from './dialog/customer-chat-detail/customer-chat-detail.component';

@NgModule({
  declarations: [ChatHistoryComponent, MessageHistoryComponent, ChatComponent, CustomerChatDetailComponent],
  imports: [
    CommonModule,
    AgGridModule.withComponents([]),
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    NgSelectModule
  ],
  entryComponents: [ChatHistoryComponent, MessageHistoryComponent,CustomerChatDetailComponent],
  providers: [ChatService],
  exports: [ChatComponent]
})
export class ChatModule { }
