import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb/dist/pouchdb';
@Injectable({
  providedIn: 'root'
})
export class PouchDbService {

  private isInstantiated: boolean = false;
  private pouch: any;
  constructor() {
      if (!this.isInstantiated) {
          this.pouch = new PouchDB('crm', {
              // PouchDB doesn't overwrite data - it creates revisions (like Git).
              // For the purposes of this app, however, we don't need those revisions
              // to stay around, taking up storage space. By enabling auto_compaction,
              // PouchDB will only keep the most current revision in storage.
              revs_limit: 1,
              auto_compaction: true
          });
          this.isInstantiated = true;
      }
      this.pouch.compact().then(function (result) {
          // handle result
      }).catch(function (err) {
          console.log(err);
      });
  }

  removeDocIfTTLStop(data: any) {
      const prepareData = [];
      if (data !== undefined && data !== null && data.length > 0) {
          for (const obj of data) {
              if (obj.doc.ttl !== undefined && (obj.doc.time_store_ttl + obj.doc.ttl) < Math.floor(Date.now() / 1000)) {
                  this.deleteDocument(obj.id);
              } else {
                  prepareData.push(obj);
              }
          }
      }
      return prepareData;
  }

  // add documents. Returns a promise of the generated id.
  /**
  * @param {any} dataForInsert
  * @param {number} ttl
  * @returns Promise
  */
  public addDocuments(dataForInsert: any, ttl?: number): Promise<string> {

      // NOTE: All crm are given the key-prefix of "crm:". This way, when we go
      // to query for crm, we can limit the scope to keys with in this key-space.
      return this.pouch
          .put(
              {
                  _id: ('crm:' + (new Date()).getTime()),
                  data: dataForInsert,
                  ttl: ttl,
                  time_store_ttl: Math.floor(Date.now() / 1000)
              }
          )
          .then((result: any): string => {
              return (result.id);
          });
  }
  /**
  * @param {string} id
  */
  public deleteDocument(id: string) {
      this.pouch
          .get(id).then((doc: any): any => {
              return (this.pouch.remove(doc._id, doc._rev));
          })
          .then((result: any): void => {
              // Here, just stripping out the result so that the PouchDB
              // response isn't returned to the calling context.
              return;
          });
  }

  public getDocuments(): Promise<any> {
      const self = this;
      const promise = this.pouch.allDocs({
          include_docs: true,
          // In PouchDB, all keys are stored in a single collection. So, in order
          // to return just the subset of "crm" keys, we're going to query for
          // all documents that have a "crm:" key prefix. This is known as
          // "creative keying" in the CouchDB world.

          // startkey: 'crm:',
          // endKey: 'crm:\uffff'
      }).then((result: any): any => {
          // Convert the raw data storage into something more natural for the
          // calling context to consume.
          const dataFromDB = result.rows.map((row: any): any => {
              return (row);
          });
          return (self.removeDocIfTTLStop(dataFromDB));
      });
      return (promise)
          ;
  }

  public addBulkData(dataForInsert: any, ttl?: number): Promise<string> {

      // NOTE: All crm are given the key-prefix of "crm:". This way, when we go
      // to query for crm, we can limit the scope to keys with in this key-space.
      return this.pouch
          .bulkDocs(dataForInsert)
          .then((result: any): string => {
              this.getDocuments();
              return (result.id);
          });
  }

  public getDocById(id): Promise<any> {
      const self = this;
      const promise = this.pouch.get(id).then((result: any): any => {
          this.getDocuments();
          return result;
      });
      return (promise)
          ;
  }

  public clearDB() {
      return new Promise((resolve, reject) => {
          this.getDocuments().then(async (data) => {
              if (data && data.length > 0) {
                  for (let obj of data) {
                      try {
                          await this.deleteDocument(obj.id);
                      } catch (e) {

                      }
                  }
                  resolve(true);
              } else {
                  resolve(true);
              }
          });
      })
  }

  public deleteDB() {
      return new Promise((resolve, reject) => {
          this.pouch.destroy().then(function () {
              resolve(true);
              // database destroyed
          }).catch(function (err) {
              resolve(false);
              // error occurred
          })
      })
  }
}
