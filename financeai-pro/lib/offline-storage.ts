import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'finance-ai-offline'
const DB_VERSION = 1

export interface OfflineTransaction {
  id?: number
  offlineId: string
  amount: number
  category: string
  description?: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  synced: boolean
}

let dbPromise: Promise<IDBPDatabase> | null = null

if (typeof window !== 'undefined') {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('synced', 'synced')
        store.createIndex('offlineId', 'offlineId', { unique: true })
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'url' })
      }
    },
  })
}

export async function isOnline(): Promise<boolean> {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export async function saveOfflineTransaction(transaction: Omit<OfflineTransaction, 'id' | 'synced'>) {
  const db = await dbPromise
  if (!db) return

  await db.add('transactions', {
    ...transaction,
    synced: false,
  })
}

export async function getUnsyncedTransactions(): Promise<OfflineTransaction[]> {
  const db = await dbPromise
  if (!db) return []

  return db.getAllFromIndex('transactions', 'synced', 0)
}

export async function markAsSynced(id: number) {
  const db = await dbPromise
  if (!db) return

  const tx = await db.get('transactions', id)
  if (tx) {
    tx.synced = true
    await db.put('transactions', tx)
  }
}

export async function cacheData(url: string, data: any) {
  const db = await dbPromise
  if (!db) return

  await db.put('cache', {
    url,
    data,
    timestamp: Date.now()
  })
}

export async function getCachedData(url: string): Promise<any | null> {
  const db = await dbPromise
  if (!db) return null

  const entry = await db.get('cache', url)
  return entry ? entry.data : null
}
