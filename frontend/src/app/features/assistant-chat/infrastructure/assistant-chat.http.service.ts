import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductSuggestion } from '../models/assistant-chat.model';

export interface N8nChatResponse {
  status: string;
  data?: {
    residue?: string;
    replyText?: string;
    suggestions?: readonly ProductSuggestion[];
  };
}

export interface AssistantChatResponse {
  replyText?: string;
  suggestions?: readonly ProductSuggestion[];
}

@Injectable()
export class AssistantChatHttpService {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = 'https://n8n-production-7f55.up.railway.app/webhook/botdotcom';

  sendMessage(sessionId: string, residueInput: string): Observable<AssistantChatResponse> {
    const headers = new HttpHeaders({
      'x-session-id': sessionId
    });

    return this.http.post<any>(this.webhookUrl, { residuo: residueInput }, { headers }).pipe(
      map((res) => {
        // Fallback por si en n8n envían directamente la salida del agente LangChain
        if (Array.isArray(res) && res.length > 0 && res[0].output) {
          return {
            replyText: res[0].output,
            suggestions: []
          };
        }

        return {
          replyText: res?.data?.replyText,
          suggestions: res?.data?.suggestions || []
        };
      })
    );
  }
}
