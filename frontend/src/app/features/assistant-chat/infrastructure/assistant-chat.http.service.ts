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
  // https://n8n-production-7f55.up.railway.app/webhook/recicla-ia';
  // url test n8n https://n8n-production-7f55.up.railway.app/webhook-test/recicla-ia';

  sendMessage(sessionId: string, residueInput: string): Observable<AssistantChatResponse> {
    const headers = new HttpHeaders({
      'x-session-id': sessionId
    });

    return this.http.post<any>(this.webhookUrl, { residuo: residueInput }, { headers }).pipe(
      map((res) => {
        // Fallback por si n8n envia directamente la salida del agente LangChain
        if (Array.isArray(res) && res.length > 0 && res[0].output) {
          return {
            replyText: res[0].output,
            suggestions: []
          };
        }

        const suggestions = this.normalizeSuggestions(res?.data?.suggestions ?? res?.suggestions ?? []);

        return {
          replyText: res?.data?.replyText ?? res?.replyText,
          suggestions
        };
      })
    );
  }

  private normalizeSuggestions(raw: unknown): readonly ProductSuggestion[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item) => this.toSuggestion(item))
      .filter((item): item is ProductSuggestion => item !== null);
  }

  private toSuggestion(raw: unknown): ProductSuggestion | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const item = raw as Record<string, unknown>;
    const id = this.readStringAny(item, 'id', 'productId', 'product_id', 'slug', 'productSlug', 'product_slug')
      ?? this.slugify(this.readStringAny(item, 'productName', 'nombreProducto', 'name', 'product_name') ?? '');

    if (!id) {
      return null;
    }

    const productName = this.readStringAny(item, 'productName', 'nombreProducto', 'name', 'product_name')
      ?? id;

    const listingNode = this.readRecordAny(item, 'listing', 'publication');
    const listingId = this.readStringAny(
      item,
      'listingId',
      'listing_id',
      'listingGuid',
      'listing_guid',
      'publicationId',
      'publication_id'
    )
      ?? (listingNode ? this.readStringAny(listingNode, 'id', 'listingId', 'guid') : null);

    const complexityRaw = (this.readStringAny(item, 'complexity', 'nivelComplejidad', 'complexity_level') ?? 'medium').toLowerCase();
    const potentialRaw = (this.readStringAny(item, 'marketPotential', 'potencialMercado', 'market_potential') ?? 'medium').toLowerCase();

    return {
      id,
      listingId: listingId ?? null,
      residueInput: this.readStringAny(item, 'residueInput', 'residuo', 'residue_input') ?? '',
      productName,
      description: this.readStringAny(item, 'description', 'descripcion') ?? '',
      sectorName: this.readStringAny(item, 'sectorName', 'sector', 'sector_name') ?? '',
      complexity: complexityRaw === 'low' || complexityRaw === 'high' ? complexityRaw : 'medium',
      marketPotential: potentialRaw === 'low' || potentialRaw === 'high' ? potentialRaw : 'medium',
      iconName: this.readStringAny(item, 'iconName', 'icon', 'icon_name') ?? 'wheat'
    };
  }

  private readStringAny(item: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
      const direct = this.readString(item, key);
      if (direct) {
        return direct;
      }
    }

    const map = new Map<string, unknown>();
    for (const [k, v] of Object.entries(item)) {
      map.set(k.toLowerCase(), v);
    }

    for (const key of keys) {
      const value = map.get(key.toLowerCase());
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }

    return null;
  }

  private readRecordAny(item: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
    for (const key of keys) {
      const value = item[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
    }

    const map = new Map<string, unknown>();
    for (const [k, v] of Object.entries(item)) {
      map.set(k.toLowerCase(), v);
    }

    for (const key of keys) {
      const value = map.get(key.toLowerCase());
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
    }

    return null;
  }

  private readString(item: Record<string, unknown>, key: string): string | null {
    const value = item[key];
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
