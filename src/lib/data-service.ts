
import type { Character, CommissionOption, Order, ApplicationData, SiteContent, CommissionStyle, CharacterSeries, Contracts } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

// Helper function for API requests
async function fetchAPI(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`API Error (${res.status}) on ${path}:`, errorBody);
    throw new Error(`Failed to fetch ${path}`);
  }
  // For DELETE requests, there might not be a body
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }
  return res.json();
}


// Site Content
export async function getSiteContent(): Promise<SiteContent | null> {
    return fetchAPI('/site-content');
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
    await fetchAPI('/site-content', { method: 'POST', body: JSON.stringify(content) });
}

// Contracts
export async function getContracts(): Promise<Contracts | null> {
    return fetchAPI('/contracts');
}

export async function saveContracts(contracts: Contracts): Promise<void> {
    await fetchAPI('/contracts', { method: 'POST', body: JSON.stringify(contracts) });
}


// Character Series
export async function getCharacterSeries(): Promise<CharacterSeries[]> {
    return fetchAPI('/character-series');
}

export async function getCharacterSeriesById(id: string): Promise<CharacterSeries | null> {
    return fetchAPI(`/character-series/${id}`);
}

export async function getCharacterSeriesByName(name: string): Promise<CharacterSeries | null> {
    const allSeries = await getCharacterSeries();
    return allSeries.find(s => s.name === name) || null;
}

export async function saveCharacterSeries(series: Omit<CharacterSeries, 'id'>, id?: string): Promise<string> {
    if (id) {
        await fetchAPI(`/character-series/${id}`, { method: 'PUT', body: JSON.stringify(series) });
        return id;
    } else {
        const newSeries = await fetchAPI('/character-series', { method: 'POST', body: JSON.stringify(series) });
        return newSeries.id;
    }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
    await fetchAPI(`/character-series/${id}`, { method: 'DELETE' });
}

// Characters (Adoption)
export async function getCharacters(): Promise<Character[]> {
  return fetchAPI('/characters');
}

export async function getCharactersBySeriesId(seriesId: string): Promise<Character[]> {
  const allCharacters = await getCharacters();
  return allCharacters.filter(character => character.seriesId === seriesId);
}

export async function getCharacterById(id: string): Promise<Character | null> {
  return fetchAPI(`/characters/${id}`);
}

export async function getCharacterByName(name: string): Promise<Character | null> {
  const characters = await getCharacters();
  return characters.find(char => char.name === name) || null;
}

export async function saveCharacter(character: Omit<Character, 'id'>, id?: string): Promise<string> {
  if (id) {
    await fetchAPI(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(character) });
    return id;
  } else {
    const newChar = await fetchAPI('/characters', { method: 'POST', body: JSON.stringify(character) });
    return newChar.id;
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  await fetchAPI(`/characters/${id}`, { method: 'DELETE' });
}


// Commission Options
export async function getCommissionOptions(): Promise<CommissionOption[]> {
  return fetchAPI('/commissions');
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    return fetchAPI(`/commissions/${id}`);
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
  const options = await getCommissionOptions();
  return options.find(opt => opt.name === name) || null;
}

export async function saveCommissionOption(commissionOption: Omit<CommissionOption, 'id'>, id?: string): Promise<string> {
    if (id) {
        await fetchAPI(`/commissions/${id}`, { method: 'PUT', body: JSON.stringify(commissionOption) });
        return id;
    } else {
        const newOption = await fetchAPI('/commissions', { method: 'POST', body: JSON.stringify(commissionOption) });
        return newOption.id;
    }
}

export async function deleteCommissionOption(id: string): Promise<void> {
    await fetchAPI(`/commissions/${id}`, { method: 'DELETE' });
}

// Commission Styles
export async function getCommissionStylesByOptionId(optionId: string): Promise<CommissionStyle[]> {
    const allStyles = await fetchAPI('/commission-styles');
    return allStyles.filter((style: CommissionStyle) => style.commissionOptionId === optionId);
}

export async function getCommissionStyleById(id: string): Promise<CommissionStyle | null> {
    return fetchAPI(`/commission-styles/${id}`);
}

export async function getAllCommissionStyles(): Promise<CommissionStyle[]> {
    return fetchAPI('/commission-styles');
}

export async function saveCommissionStyle(style: Omit<CommissionStyle, 'id'>, id?: string): Promise<string> {
    if (id) {
        await fetchAPI(`/commission-styles/${id}`, { method: 'PUT', body: JSON.stringify(style) });
        return id;
    } else {
        const newStyle = await fetchAPI('/commission-styles', { method: 'POST', body: JSON.stringify(style) });
        return newStyle.id;
    }
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    await fetchAPI(`/commission-styles/${id}`, { method: 'DELETE' });
}


// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return fetchAPI(`/orders?userId=${userId}`);
}

export async function getAllOrders(): Promise<Order[]> {
    return fetchAPI('/orders');
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  return fetchAPI(`/orders/${orderId}`);
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    await fetchAPI(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteOrder(id: string): Promise<void> {
    await fetchAPI(`/orders/${id}`, { method: 'DELETE' });
}

// Order Actions
export async function createAdoptionApplication(userId: string, character: Character, applicationData: ApplicationData): Promise<string> {
  const body = { userId, character, applicationData };
  const newOrder = await fetchAPI('/orders/create-adoption', { method: 'POST', body: JSON.stringify(body) });
  return newOrder.id;
}

export async function createCommissionApplication(userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData): Promise<string> {
    const body = { userId, commissionStyle, applicationData };
    const newOrder = await fetchAPI('/orders/create-commission', { method: 'POST', body: JSON.stringify(body) });
    return newOrder.id;
}

export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  await fetchAPI(`/orders/${orderId}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
}

export async function reinstateOrder(orderId: string): Promise<void> {
    await fetchAPI(`/orders/${orderId}/reinstate`, { method: 'POST' });
}

export async function confirmCommissionOrder(orderId: string): Promise<Order> {
    return fetchAPI(`/orders/${orderId}/confirm`, { method: 'POST' });
}
