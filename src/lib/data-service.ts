// This service is responsible for all client-side data fetching.
// It communicates with the backend API routes.

import type { Order, Character, CommissionOption, SiteContent, ApplicationData, CommissionStyle, CharacterSeries, Contracts } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api/${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Adding cache: 'no-store' to ensure fresh data from the server,
      // which is crucial as we are reading from JSON files.
      cache: 'no-store', 
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`API Error (${res.status}) on ${path}:`, errorBody);
      throw new Error(`Failed to fetch ${path}`);
    }
    
    // For DELETE requests, there might not be a body
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return null as T;
    }
    
    return await res.json() as T;
  } catch (error) {
    console.error(`Network error or failed to fetch from ${url}:`, error);
    throw error;
  }
}

// Site Content
export async function getSiteContent(): Promise<SiteContent> {
  return fetchAPI<SiteContent>('site-content');
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await fetchAPI('site-content', { method: 'POST', body: JSON.stringify(content) });
}

// Contracts
export async function getContracts(): Promise<Contracts> {
    return fetchAPI<Contracts>('contracts');
}

export async function saveContracts(contracts: Contracts): Promise<void> {
    await fetchAPI('contracts', { method: 'POST', body: JSON.stringify(contracts) });
}

// Character Series
export async function getCharacterSeries(): Promise<CharacterSeries[]> {
    return fetchAPI<CharacterSeries[]>('character-series');
}

export async function getCharacterSeriesById(id: string): Promise<CharacterSeries | null> {
    return fetchAPI<CharacterSeries | null>(`character-series/${id}`);
}

export async function getCharacterSeriesByName(name: string): Promise<CharacterSeries | null> {
    const allSeries = await getCharacterSeries();
    return allSeries.find(s => s.name === name) || null;
}

export async function saveCharacterSeries(seriesData: Omit<CharacterSeries, 'id'>, id?: string): Promise<CharacterSeries> {
    if (id) {
        return fetchAPI<CharacterSeries>(`character-series/${id}`, { method: 'PUT', body: JSON.stringify(seriesData) });
    } else {
        return fetchAPI<CharacterSeries>('character-series', { method: 'POST', body: JSON.stringify(seriesData) });
    }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
    await fetchAPI(`character-series/${id}`, { method: 'DELETE' });
}


// Characters (Adoption)
export async function getCharacters(): Promise<Character[]> {
  return fetchAPI<Character[]>('characters');
}

export async function getCharactersBySeriesId(seriesId: string): Promise<Character[]> {
  const allCharacters = await getCharacters();
  return allCharacters.filter(character => character.seriesId === seriesId);
}

export async function getCharacterById(id: string): Promise<Character | null> {
    return fetchAPI<Character | null>(`characters/${id}`);
}

export async function getCharacterByName(name: string): Promise<Character | null> {
    const characters = await getCharacters();
    return characters.find(char => char.name === name) || null;
}

export async function saveCharacter(characterData: Omit<Character, 'id'>, id?: string): Promise<Character> {
    if (id) {
        return fetchAPI<Character>(`characters/${id}`, { method: 'PUT', body: JSON.stringify(characterData) });
    } else {
        return fetchAPI<Character>('characters', { method: 'POST', body: JSON.stringify(characterData) });
    }
}

export async function deleteCharacter(id: string): Promise<void> {
  await fetchAPI(`characters/${id}`, { method: 'DELETE' });
}


// Commission Options
export async function getCommissionOptions(): Promise<CommissionOption[]> {
  return fetchAPI<CommissionOption[]>('commissions');
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    return fetchAPI<CommissionOption | null>(`commissions/${id}`);
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
    const options = await getCommissionOptions();
    return options.find(opt => opt.name === name) || null;
}

export async function saveCommissionOption(data: Omit<CommissionOption, 'id'>, id?: string): Promise<CommissionOption> {
     if (id) {
        return fetchAPI<CommissionOption>(`commissions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        return fetchAPI<CommissionOption>('commissions', { method: 'POST', body: JSON.stringify(data) });
    }
}

export async function deleteCommissionOption(id: string): Promise<void> {
    await fetchAPI(`commissions/${id}`, { method: 'DELETE' });
}


// Commission Styles
export async function getAllCommissionStyles(): Promise<CommissionStyle[]> {
    return fetchAPI<CommissionStyle[]>('commission-styles');
}

export async function getCommissionStylesByOptionId(optionId: string): Promise<CommissionStyle[]> {
    const allStyles = await getAllCommissionStyles();
    return allStyles.filter((style: CommissionStyle) => style.commissionOptionId === optionId);
}

export async function getCommissionStyleById(id: string): Promise<CommissionStyle | null> {
    return fetchAPI<CommissionStyle | null>(`commission-styles/${id}`);
}

export async function saveCommissionStyle(data: Omit<CommissionStyle, 'id'>, id?: string): Promise<CommissionStyle> {
    if (id) {
        return fetchAPI<CommissionStyle>(`commission-styles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
        return fetchAPI<CommissionStyle>('commission-styles', { method: 'POST', body: JSON.stringify(data) });
    }
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    await fetchAPI(`commission-styles/${id}`, { method: 'DELETE' });
}


// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return fetchAPI<Order[]>(`orders?userId=${userId}`);
}

export async function getAllOrders(): Promise<Order[]> {
    const orders = await fetchAPI<Order[]>('orders');
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  return fetchAPI<Order | null>(`orders/${orderId}`);
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<Order> {
    return fetchAPI<Order>(`orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteOrder(id: string): Promise<void> {
    await fetchAPI(`orders/${id}`, { method: 'DELETE' });
}

export async function createAdoptionApplication(userId: string, character: Character, applicationData: ApplicationData): Promise<Order> {
    return fetchAPI<Order>('orders/create-adoption', {
        method: 'POST',
        body: JSON.stringify({ userId, character, applicationData }),
    });
}

export async function createCommissionApplication(userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData): Promise<Order> {
     return fetchAPI<Order>('orders/create-commission', {
        method: 'POST',
        body: JSON.stringify({ userId, commissionStyle, applicationData }),
    });
}


// User-facing order actions
export async function cancelOrder(orderId: string, reason: string): Promise<Order> {
    return fetchAPI<Order>(`orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    });
}

export async function reinstateOrder(orderId: string): Promise<Order> {
    return fetchAPI<Order>(`orders/${orderId}/reinstate`, { method: 'POST' });
}

export async function confirmCommissionOrder(orderId: string): Promise<Order> {
    return fetchAPI<Order>(`orders/${orderId}/confirm`, { method: 'POST' });
}
