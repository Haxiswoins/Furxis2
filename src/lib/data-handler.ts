// IMPORTANT: This file contains server-side logic only and should not be
// imported into client-side components. It provides direct access to the
// JSON data files.
import path from 'path';
import { promises as fs } from 'fs';
import type { SiteContent, Contracts, CharacterSeries, Character, CommissionOption, CommissionStyle, Order, ApplicationData } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const jsonDirectory = path.join(process.cwd(), 'data');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Generic read/write functions
async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(jsonDirectory, filename);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn(`File ${filename} not found, returning empty array/object.`);
      if (filename === 'siteContent.json') return {} as T;
      if (filename === 'contracts.json') return {} as T;
      return [] as T;
    }
    console.error(`Error reading or parsing ${filename}:`, error);
    throw error;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(jsonDirectory, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


// --- SiteContent ---
export const getSiteContentHandler = () => readJsonFile<SiteContent>('siteContent.json');
export const saveSiteContentHandler = (data: SiteContent) => writeJsonFile('siteContent.json', data);

// --- Contracts ---
export const getContractsHandler = () => readJsonFile<Contracts>('contracts.json');
export const saveContractsHandler = (data: Contracts) => writeJsonFile('contracts.json', data);

// --- CharacterSeries ---
export const getCharacterSeriesHandler = () => readJsonFile<CharacterSeries[]>('characterSeries.json');
export const getCharacterSeriesByIdHandler = async (id: string) => {
  const allSeries = await getCharacterSeriesHandler();
  return allSeries.find(s => s.id === id) || null;
};
export const saveCharacterSeriesHandler = async (seriesData: Omit<CharacterSeries, 'id'>, id?: string) => {
  const allSeries = await getCharacterSeriesHandler();
  if (id) {
    const index = allSeries.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Series not found');
    const updatedSeries = { ...allSeries[index], ...seriesData };
    allSeries[index] = updatedSeries;
    await writeJsonFile('characterSeries.json', allSeries);
    return updatedSeries;
  } else {
    const newSeries: CharacterSeries = { id: `series_${Date.now()}`, ...seriesData };
    allSeries.push(newSeries);
    await writeJsonFile('characterSeries.json', allSeries);
    return newSeries;
  }
};
export const deleteCharacterSeriesHandler = async (id: string) => {
  const allSeries = await getCharacterSeriesHandler();
  const filtered = allSeries.filter(s => s.id !== id);
  if (allSeries.length === filtered.length) throw new Error('Series not found');
  await writeJsonFile('characterSeries.json', filtered);
};

// --- Characters ---
export const getCharactersHandler = () => readJsonFile<Character[]>('characters.json');
export const getCharacterByIdHandler = async (id: string) => {
    const characters = await getCharactersHandler();
    return characters.find(c => c.id === id) || null;
}
export const saveCharacterHandler = async (characterData: Omit<Character, 'id'>, id?: string) => {
    const characters = await getCharactersHandler();
    if (id) {
        const index = characters.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Character not found');
        const updatedCharacter = { ...characters[index], ...characterData };
        characters[index] = updatedCharacter;
        await writeJsonFile('characters.json', characters);
        return updatedCharacter;
    } else {
        const newCharacter: Character = { id: `char_${Date.now()}`, ...characterData };
        characters.push(newCharacter);
        await writeJsonFile('characters.json', characters);
        return newCharacter;
    }
}
export const deleteCharacterHandler = async (id: string) => {
    const characters = await getCharactersHandler();
    const filtered = characters.filter(c => c.id !== id);
    if (characters.length === filtered.length) throw new Error('Character not found');
    await writeJsonFile('characters.json', filtered);
}


// --- CommissionOptions ---
export const getCommissionOptionsHandler = () => readJsonFile<CommissionOption[]>('commissionOptions.json');
export const getCommissionOptionByIdHandler = async (id: string) => {
    const options = await getCommissionOptionsHandler();
    return options.find(o => o.id === id) || null;
}
export const saveCommissionOptionHandler = async (data: Omit<CommissionOption, 'id'>, id?: string) => {
    const options = await getCommissionOptionsHandler();
    if (id) {
        const index = options.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Commission option not found');
        const updatedOption = { ...options[index], ...data };
        options[index] = updatedOption;
        await writeJsonFile('commissionOptions.json', options);
        return updatedOption;
    } else {
        const newOption: CommissionOption = { id: `comm_${Date.now()}`, ...data };
        options.push(newOption);
        await writeJsonFile('commissionOptions.json', options);
        return newOption;
    }
}
export const deleteCommissionOptionHandler = async (id: string) => {
    const options = await getCommissionOptionsHandler();
    const filtered = options.filter(o => o.id !== id);
    if (options.length === filtered.length) throw new Error('Commission option not found');
    await writeJsonFile('commissionOptions.json', filtered);
}


// --- CommissionStyles ---
export const getCommissionStylesHandler = () => readJsonFile<CommissionStyle[]>('commissionStyles.json');
export const getCommissionStyleByIdHandler = async (id: string) => {
    const styles = await getCommissionStylesHandler();
    return styles.find(s => s.id === id) || null;
}
export const saveCommissionStyleHandler = async (data: Omit<CommissionStyle, 'id'>, id?: string) => {
    const styles = await getCommissionStylesHandler();
    if (id) {
        const index = styles.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Commission style not found');
        const updatedStyle = { ...styles[index], ...data };
        styles[index] = updatedStyle;
        await writeJsonFile('commissionStyles.json', styles);
        return updatedStyle;
    } else {
        const newStyle: CommissionStyle = { id: `style_${Date.now()}`, ...data };
        styles.push(newStyle);
        await writeJsonFile('commissionStyles.json', styles);
        return newStyle;
    }
}
export const deleteCommissionStyleHandler = async (id: string) => {
    const styles = await getCommissionStylesHandler();
    const filtered = styles.filter(s => s.id !== id);
    if (styles.length === filtered.length) throw new Error('Commission style not found');
    await writeJsonFile('commissionStyles.json', filtered);
}


// --- Orders ---
export const getOrdersHandler = () => readJsonFile<Order[]>('orders.json');
export const getOrderByIdHandler = async (id: string) => {
    const orders = await getOrdersHandler();
    return orders.find(o => o.id === id) || null;
}
export const deleteOrderHandler = async (id: string) => {
    const orders = await getOrdersHandler();
    const filtered = orders.filter(o => o.id !== id);
    if (orders.length === filtered.length) throw new Error('Order not found');
    await writeJsonFile('orders.json', filtered);
}
export const updateOrderHandler = async (id: string, data: Partial<Order>) => {
    const orders = await getOrdersHandler();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const originalOrder = orders[index];
    const updatedOrder = { ...originalOrder, ...data };
    orders[index] = updatedOrder;

    if (originalOrder.status !== '待确认' && updatedOrder.status === '待确认' && updatedOrder.orderType === '委托订单') {
         try {
            const contracts = await getContractsHandler();
            const userEmail = updatedOrder.applicationData?.email;
            
            if(contracts.commissionConfirmationEmail && userEmail) {
                let emailHtml = contracts.commissionConfirmationEmail.replace('{productName}', updatedOrder.productName);
                await sendEmail({
                    to: userEmail,
                    from: 'notification@suitopia.club',
                    subject: `您的委托申请已通过初审！`,
                    html: emailHtml
                });
            }
         } catch(e) {
            console.error("Failed to send commission confirmation email:", e);
         }
    }
    await writeJsonFile('orders.json', orders);
    return updatedOrder;
}
export const createAdoptionApplicationHandler = async (userId: string, character: Character, applicationData: ApplicationData) => {
    const orders = await getOrdersHandler();
    const characters = await getCharactersHandler();

    const orderNumber = `S${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
        id: `order_${Date.now()}`,
        userId,
        productName: character.name,
        orderNumber,
        orderType: '领养订单',
        status: '申请中',
        imageUrl: character.imageUrl,
        orderDate: new Date().toISOString(),
        total: character.price,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
    };
    
    orders.push(newOrder);

    const charIndex = characters.findIndex(c => c.id === character.id);
    if (charIndex > -1) {
        characters[charIndex].applicants += 1;
    }
    
    try {
        const siteContent = await getSiteContentHandler();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[新领养申请] ${character.name}`,
                html: `<h1>新的领养申请</h1><p>您收到了一个新的设定领养申请。请登录后台查看并处理。</p><ul><li><strong>产品名称:</strong> ${character.name}</li><li><strong>订单号:</strong> ${newOrder.orderNumber}</li><li><strong>申请人:</strong> ${applicationData.userName}</li><li><strong>联系电话:</strong> ${applicationData.phone}</li></ul><p>请<a href="${BASE_URL}/admin/orders/edit/${newOrder.id}">点击这里</a>处理订单。</p>`
            });
        }
    } catch (emailError) {
        console.error("Failed to send new adoption notification email:", emailError);
    }

    await writeJsonFile('orders.json', orders);
    await writeJsonFile('characters.json', characters);
    return newOrder;
}

export const createCommissionApplicationHandler = async (userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData) => {
    const orders = await getOrdersHandler();
    const orderNumber = `C${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
        id: `order_${Date.now()}`,
        userId,
        productName: commissionStyle.name,
        orderNumber,
        orderType: '委托订单',
        status: '申请中',
        imageUrl: commissionStyle.imageUrl,
        orderDate: new Date().toISOString(),
        total: `${commissionStyle.price} (估价)`,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
        referenceImageUrl: applicationData.referenceImageUrl || null,
    };

    orders.push(newOrder);

    try {
        const siteContent = await getSiteContentHandler();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[新委托申请] ${commissionStyle.name}`,
                html: `<h1>新的委托申请</h1><p>您收到了一个新的委托申请。请登录后台查看并处理。</p><ul><li><strong>产品名称:</strong> ${commissionStyle.name}</li><li><strong>订单号:</strong> ${newOrder.orderNumber}</li><li><strong>申请人:</strong> ${applicationData.userName}</li><li><strong>联系电话:</strong> ${applicationData.phone}</li></ul><p>请<a href="${BASE_URL}/admin/orders/edit/${newOrder.id}">点击这里</a>处理订单。</p>`
            });
        }
    } catch (emailError) {
        console.error("Failed to send new commission notification email:", emailError);
    }
    
    await writeJsonFile('orders.json', orders);
    return newOrder;
}
export const cancelOrderHandler = async (id: string, reason: string) => {
    const orders = await getOrdersHandler();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.status = '取消中';
    order.cancellationReason = reason;

    try {
        const siteContent = await getSiteContentHandler();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club', 
                subject: `[取消申请] 用户申请取消订单 #${order.orderNumber}`,
                html: `
                    <h1>新的取消申请</h1>
                    <p>用户已申请取消一个订单。请登录后台查看并处理。</p>
                    <ul>
                        <li><strong>订单号:</strong> ${order.orderNumber}</li>
                        <li><strong>产品名称:</strong> ${order.productName}</li>
                        <li><strong>用户ID:</strong> ${order.userId}</li>
                        <li><strong>取消原因:</strong> ${reason}</li>
                    </ul>
                    <p>请<a href="${BASE_URL}/admin/orders/edit/${order.id}">点击这里</a>处理订单。</p>
                `
            });
        }
    } catch (emailError) {
        console.error("Failed to send cancellation notification email:", emailError);
    }
    
    await writeJsonFile('orders.json', orders);
    return order;
}

export const reinstateOrderHandler = async (id: string) => {
    const orders = await getOrdersHandler();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    orders[index].status = '申请中';
    orders[index].cancellationReason = '';

    await writeJsonFile('orders.json', orders);
    return orders[index];
}

export const confirmCommissionOrderHandler = async (id: string) => {
    const orders = await getOrdersHandler();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    const order = orders[index];
    if (order.status !== '待确认') throw new Error('Order cannot be confirmed');

    order.status = '已确认';

    try {
        const siteContent = await getSiteContentHandler();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[订单已确认] 用户已确认订单 #${order.orderNumber}`,
                html: `
                    <h1>订单已确认</h1>
                    <p>用户已确认了他们的委托订单，状态已更新为“已确认”。</p>
                    <ul>
                        <li><strong>订单号:</strong> ${order.orderNumber}</li>
                        <li><strong>产品名称:</strong> ${order.productName}</li>
                        <li><strong>用户ID:</strong> ${order.userId}</li>
                    </ul>
                    <p>请<a href="${BASE_URL}/admin/orders/edit/${order.id}">点击这里</a>查看订单详情。</p>
                `
            });
        }
    } catch (emailError) {
        console.error("Failed to send order confirmation email to admin:", emailError);
    }
    
    await writeJsonFile('orders.json', orders);
    return order;
}
