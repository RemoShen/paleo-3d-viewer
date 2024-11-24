import { Expose, Type } from "class-transformer";
import 'reflect-metadata';
import { Fossil } from "./fossil.model";


export class Project {

    @Expose()
    @Type(() => Fossil)
    fossils: Fossil[] = [];

    constructor( 
        public project_id: string, 
        public date_created: string, 
        public name: string ){}
}