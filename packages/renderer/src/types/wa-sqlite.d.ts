declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS' {
  export class IDBBatchAtomicVFS {
    name: string;
    constructor(dbName?: string);
  }
}

declare module 'wa-sqlite/dist/wa-sqlite-async.mjs' {
  const SQLiteESMFactory: any;
  export default SQLiteESMFactory;
}

declare module 'wa-sqlite' {
  export function Factory(module: any): any;
} 