import { Injectable } from '@angular/core';
import { Subject, merge, Observable, Subscribable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParameterStoreService {

  private parametersSubjects: {[name: string]: Subject<any>};
  private parametersState: {[name: string]: any};

  constructor() {
    this.parametersSubjects = {};
    this.parametersState = {};
  }

  public registerParameter<T>(name: string, initValue: T = null): Subject<T> {
    let paramSubject = null;
    //ensure this parameter does not already exist
    if(this.parametersSubjects[name] == undefined) {
      paramSubject = new Subject<T>();
      this.parametersSubjects[name] = paramSubject;
      this.parametersState[name] = initValue;
    }
    return paramSubject;
  }

  // public getParametersListener(paramNames?: string[]): Observable<ParameterEvent<any>> {
  //   let observables = [];
  //   if(paramNames == undefined) {
  //     let subjects = Object.values(this.parametersSubjects);
  //     subjects.forEach((subject: Subject<ParameterEvent<any>>) => {
  //       observables.push(subject.asObservable());
  //     });
  //   }
  //   else {
  //     paramNames.forEach((name: string) => {
  //       let subject = this.parametersSubjects[name];
  //       if(subject != undefined) {
  //         observables.push(subject.asObservable());
  //       }    
  //     });
  //   }
  //   return merge(...observables);
  // }

  public createParameterHook(paramName: string, cb: (value: any) => void, install: boolean = true): ParameterHook {
    let hook: ParameterHook = null;
    let subject: Subject<any> = this.parametersSubjects[paramName];
    if(subject != undefined) {
      hook = new ParameterHook(subject, cb);
      if(install) {
        hook.install();
      }
    }

    return hook;
  }

  public getParameters(paramNames?: string[]): {[name: string]: any} {
    let params: {[name: string]: any} = {}
    if(paramNames == undefined) {
      params = this.parametersState;
    }
    else {
      paramNames.forEach((name: string) => {
        params[name] = this.parametersState[name];
      });
    }

    return params;
  }

  
}



// interface ParameterEvent<T> {
//   name: string,
//   value: T
// }

export class ParameterHook {
  private active: boolean;
  private sub: Subscription;
  private source: Subject<any>;
  private cb: (value: any) => void;

  constructor(source: Subject<any>, cb: (value: any) => void) {
    this.source = source;
    this.cb = cb;
  }
  
  install(): boolean {
    let installed = true;
    if(!this.active) {
      this.active = true;
      this.sub = this.source.subscribe((value: any) => {
        this.cb(value);
      });
    }
    return installed;
  }

  uninstall(): boolean {
    let uninstalled = true;
    if(this.active) {
      this.active = false;
      this.sub.unsubscribe();
    }
    return uninstalled;
  }
}