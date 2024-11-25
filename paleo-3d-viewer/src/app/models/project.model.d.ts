import 'reflect-metadata';
import { Fossil } from "./fossil.model";
export declare class Project {
    project_id: string;
    date_created: string;
    name: string;
    fossils: Fossil[];
    constructor(project_id: string, date_created: string, name: string);
}
