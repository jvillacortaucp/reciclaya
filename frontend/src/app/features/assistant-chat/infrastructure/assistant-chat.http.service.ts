import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductSuggestion, QuickLinks, UrgenciaLevel, ChatMode } from '../models/assistant-chat.model';

export interface AssistantChatResponse {
  replyText?: string;
  suggestions?: readonly ProductSuggestion[];
  tips?: string | null;
  urgencia?: UrgenciaLevel;
  modo?: ChatMode;
  quickLinks?: QuickLinks;
}

@Injectable()
export class AssistantChatHttpService {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = 'https://n8n-production-7f55.up.railway.app/webhook/ecobot'
  //https://n8n-production-7f55.up.railway.app/webhook-test/botdotcom
  //https://n8n-production-7f55.up.railway.app/webhook/botdotcom;
  // https://n8n-production-7f55.up.railway.app/webhook/recicla-ia';
  // url test n8n https://n8n-production-7f55.up.railway.app/webhook-test/recicla-ia';

  sendMessage(sessionId: string, residueInput: string, region = 'Lima', messageCount = 1): Observable<AssistantChatResponse> {
    const headers = new HttpHeaders({
      'x-session-id': sessionId
    });

    const body = {
      residuo: residueInput,
      region,
      messageCount
    };

    return this.http.post<any>(this.webhookUrl, body, { headers }).pipe(
      map((res) => {
        // Fallback por si n8n envia directamente la salida del agente LangChain
        if (Array.isArray(res) && res.length > 0 && res[0].output) {
          return {
            replyText: res[0].output,
            suggestions: []
          };
        }

        const data = res?.data ?? res;
        const suggestions = this.normalizeSuggestions(data?.suggestions ?? []);

        // Extract response-level fields from n8n v2
        const tips = this.readStringFromAny(data, 'tips') || null;
        const rawUrgencia = (this.readStringFromAny(data, 'urgencia') ?? 'media').toLowerCase();
        const urgencia: UrgenciaLevel = rawUrgencia === 'baja' || rawUrgencia === 'alta' ? rawUrgencia : 'media';
        const rawModo = (this.readStringFromAny(data, 'modo', 'mode') ?? 'charla').toLowerCase();
        const modo: ChatMode = rawModo === 'tarjetas' ? 'tarjetas' : 'charla';

        // Extract quick links
        const rawQL = data?.quickLinks ?? data?.quick_links ?? null;
        let quickLinks: QuickLinks | undefined;
        if (rawQL && typeof rawQL === 'object') {
          quickLinks = {
            googleMaps: rawQL.googleMaps ?? rawQL.google_maps ?? undefined,
            facebookMarketplace: rawQL.facebookMarketplace ?? rawQL.facebook_marketplace ?? undefined,
            whatsappInfo: rawQL.whatsappInfo ?? rawQL.whatsapp_info ?? undefined,
            localRecyclers: Array.isArray(rawQL.localRecyclers ?? rawQL.local_recyclers)
              ? (rawQL.localRecyclers ?? rawQL.local_recyclers)
              : undefined
          };
        }

        return {
          replyText: data?.replyText ?? data?.reply_text,
          suggestions,
          tips,
          urgencia,
          modo,
          quickLinks
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

    // Map new n8n v2 fields
    const monetizableRaw = item['monetizable'] ?? item['monetize'] ?? false;
    const monetizable = monetizableRaw === true || monetizableRaw === 'true';

    return {
      id,
      listingId: listingId ?? null,
      residueInput: this.readStringAny(item, 'residueInput', 'residuo', 'residue_input') ?? '',
      productName,
      description: this.readStringAny(item, 'description', 'descripcion') ?? '',
      sectorName: this.readStringAny(item, 'sectorName', 'sector', 'sector_name') ?? '',
      complexity: complexityRaw === 'low' || complexityRaw === 'high' ? complexityRaw : 'medium',
      marketPotential: potentialRaw === 'low' || potentialRaw === 'high' ? potentialRaw : 'medium',
      iconName: this.readStringAny(item, 'iconName', 'icon', 'icon_name') ?? 'wheat',
      monetizable,
      estimatedValue: this.readStringAny(item, 'estimatedValue', 'estimated_value', 'valorEstimado') ?? 'No definido',
      timeToMoney: this.readStringAny(item, 'timeToMoney', 'time_to_money', 'tiempoParaDinero') ?? 'n/a',
      minQuantity: this.readStringAny(item, 'minQuantity', 'min_quantity', 'cantidadMinima') ?? 'n/a',
      nextStep: this.readStringAny(item, 'nextStep', 'next_step', 'siguientePaso') ?? '',
      difficulty: this.readStringAny(item, 'difficulty', 'dificultad') ?? '',
      action: this.readStringAny(item, 'action', 'accion') ?? ''
    };
  }

  private readStringFromAny(obj: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
      const value = obj?.[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return null;
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
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-+|-+$/g, '');
  }
}

