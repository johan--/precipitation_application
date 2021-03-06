import { Injectable } from '@angular/core';
import { DbConService } from "../dbCon/db-con.service";
import { SiteMetadata } from "../../../../../models/SiteMetadata";
import {DataProcessorService} from "../../../../dataProcessor/data-processor.service";
import { LatLng } from "leaflet";
import dsconfig from "./DataSetConfig.json";

@Injectable({
  providedIn: 'root'
})
export class MetadataStoreService {

  //using skn as site id
  private siteMeta: Promise<SKNRefMeta>;

  constructor(private dbcon: DbConService, private processor: DataProcessorService) {
    let query = "{'name':{'$in':['RainfallStation']}}";
    query = `{'name':'${dsconfig.metaDocName}'}`;
    let resultHandler: (results: any) => SKNRefMeta = (results: any) => {
      let metadata: SKNRefMeta = {};
      results.forEach((result) => {
        //process data from database into internal metadata object
        let metadatum = processor.processMetadataDoc(result.value);
        //if returns null then the format was unexpected
        if(metadatum != null) {
          //index by skn
          metadata[metadatum.skn] = metadatum;
        }
        else {
          console.error("Unrecognized metadata document format received.");
        }
      });
      return metadata;
    }

    this.siteMeta = dbcon.query<SKNRefMeta>(query, resultHandler);
  }

  getMetaBySKN(skn: string): Promise<SiteMetadata> {
    return this.siteMeta.then((meta: SKNRefMeta) => {
      return meta[skn];
    });
  }

  getMetaBySKNs(skns: string[]): Promise<SKNRefMeta> {

    return this.siteMeta.then((meta: SKNRefMeta) => {
      let metadata: SKNRefMeta = {};
      if(skns == null) {
        metadata = meta;
      }
      else {
        skns.forEach((skn: string) => {
          metadata[skn] = meta[skn];
        });
      }
      return metadata;
    });
  }

  

}

export interface SKNRefMeta {
  [skn: string]: SiteMetadata
}


