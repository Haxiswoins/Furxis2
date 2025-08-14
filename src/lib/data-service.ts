
// This file provides functions to fetch data from the application's API routes.
// It is intended to be used by both client and server components.

import type { Character, CommissionOption, Order, ApplicationData, SiteContent, CommissionStyle, CharacterSeries, Contracts } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// A helper function to make API requests and handle errors.
async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/api/${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Cache-busting for GET requests to ensure fresh data
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`API Error (${res.status}) on ${path}:`, errorBody);
      throw new Error(`Failed to fetch ${path}`);
    }
    
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return null;
    }
    
    return await res.json();
  } catch (error) {
     if (error instanceof TypeError && error.message.includes('fetch failed')) {
        console.error(`Network error or failed to fetch API route: ${url}. Ensure the server is running and the route exists.`, error);
     } else {
        console.error(`An error occurred in fetchAPI for path ${path}:`, error);
     }
     throw error;
  }
}

// Site Content
export async function getSiteContent(): Promise<SiteContent> {
  return fetchAPI('site-content');
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await fetchAPI('site-content', {
    method: 'POST',
    body: JSON.stringify(content),
  });
}

// Contracts
export async function getContracts(): Promise<Contracts> {
  return fetchAPI('contracts');
}

export async function saveContracts(contracts: Contracts): Promise<void> {
  await fetchAPI('contracts', {
    method: 'POST',
    body: JSON.stringify(contracts),
  });
}

// Character Series
export async function getCharacterSeries(): Promise<CharacterSeries[]> {
  return fetchAPI('character-series');
}

export async function getCharacterSeriesById(id: string): Promise<CharacterSeries | null> {
  return fetchAPI(`character-series/${id}`);
}

export async function getCharacterSeriesByName(name: string): Promise<CharacterSeries | null> {
    const allSeries = await getCharacterSeries();
    return allSeries.find(s => s.name === name) || null;
}

export async function saveCharacterSeries(seriesData: Omit<CharacterSeries, 'id'>, id?: string): Promise<CharacterSeries> {
  if (id) {
    return fetchAPI(`character-series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(seriesData),
    });
  } else {
    return fetchAPI('character-series', {
      method: 'POST',
      body: JSON.stringify(seriesData),
    });
  }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
  await fetchAPI(`character-series/${id}`, { method: 'DELETE' });
}


// Characters (Adoption)
export async function getCharacters(): Promise<Character[]> {
  return fetchAPI('characters');
}

export async function getCharactersBySeriesId(seriesId: string): Promise<Character[]> {
  const allCharacters = await getCharacters();
  return allCharacters.filter(character => character.seriesId === seriesId);
}

export async function getCharacterById(id: string): Promise<Character | null> {
    return fetchAPI(`characters/${id}`);
}

export async function getCharacterByName(name: string): Promise<Character | null> {
  const characters = await getCharacters();
  return characters.find(char => char.name === name) || null;
}

export async function saveCharacter(characterData: Omit<Character, 'id'>, id?: string): Promise<Character> {
    if (id) {
        return fetchAPI(`characters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(characterData),
        });
    } else {
        return fetchAPI('characters', {
            method: 'POST',
            body: JSON.stringify(characterData),
        });
    }
}

export async function deleteCharacter(id: string): Promise<void> {
  await fetchAPI(`characters/${id}`, { method: 'DELETE' });
}


// Commission Options
export async function getCommissionOptions(): Promise<CommissionOption[]> {
  return fetchAPI('commissions');
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    return fetchAPI(`commissions/${id}`);
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
  const options = await getCommissionOptions();
  return options.find(opt => opt.name === name) || null;
}

export async function saveCommissionOption(commissionOption: Omit<CommissionOption, 'id'>, id?: string): Promise<CommissionOption> {
    if (id) {
        return fetchAPI(`commissions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(commissionOption),
        });
    } else {
        return fetchAPI('commissions', {
            method: 'POST',
            body: JSON.stringify(commissionOption),
        });
    }
}

export async function deleteCommissionOption(id: string): Promise<void> {
    await fetchAPI(`commissions/${id}`, { method: 'DELETE' });
}


// Commission Styles
export async function getAllCommissionStyles(): Promise<CommissionStyle[]> {
    return fetchAPI('commission-styles');
}

export async function getCommissionStylesByOptionId(optionId: string): Promise<CommissionStyle[]> {
    const allStyles = await getAllCommissionStyles();
    return allStyles.filter((style: CommissionStyle) => style.commissionOptionId === optionId);
}

export async function getCommissionStyleById(id: string): Promise<CommissionStyle | null> {
    return fetchAPI(`commission-styles/${id}`);
}

export async function saveCommissionStyle(style: Omit<CommissionStyle, 'id'>, id?: string): Promise<CommissionStyle> {
    if (id) {
        return fetchAPI(`commission-styles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(style),
        });
    } else {
        return fetchAPI('commission-styles', {
            method: 'POST',
            body: JSON.stringify(style),
        });
    }
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    await fetchAPI(`commission-styles/${id}`, { method: 'DELETE' });
}

// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return fetchAPI(`orders?userId=${userId}`);
}

export async function getAllOrders(): Promise<Order[]> {
    return fetchAPI('orders');
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  return fetchAPI(`orders/${orderId}`);
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    await fetchAPI(`orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteOrder(id: string): Promise<void> {
    await fetchAPI(`orders/${id}`, { method: 'DELETE' });
}


// Order Actions
export async function createAdoptionApplication(userId: string, character: Character, applicationData: ApplicationData): Promise<Order> {
    return fetchAPI('orders/create-adoption', {
        method: 'POST',
        body: JSON.stringify({ userId, character, applicationData }),
    });
}

export async function createCommissionApplication(userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData): Promise<Order> {
    return fetchAPI('orders/create-commission', {
        method: 'POST',
        body: JSON.stringify({ userId, commissionStyle, applicationData }),
    });
}


export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  await fetchAPI(`orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
  });
}

export async function reinstateOrder(orderId: string): Promise<void> {
    await fetchAPI(`orders/${orderId}/reinstate`, { method: 'POST' });
}

export async function confirmCommissionOrder(orderId: string): Promise<Order> {
    return fetchAPI(`orders/${orderId}/confirm`, { method: 'POST' });
}
