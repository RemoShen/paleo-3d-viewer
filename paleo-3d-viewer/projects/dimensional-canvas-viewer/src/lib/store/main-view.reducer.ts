// model
import { Project } from "../models/project.model";
import { Fossil } from "../models/fossil.model";

export interface IMainViewState {

    availableProjects: Project[],
    loadedProject: Project | null,
    projectFossils: { [fossilID: string]: Fossil },

    draggingFossil: Fossil | null;
    selectedFossil: Fossil | null;
    selectedScan: string | null;
    selectedFossils: Fossil[] | null;
    mode: string,

    canvasFossils: Fossil[];
}


const mainViewState: IMainViewState = {
    
    availableProjects: [],
    loadedProject: null,
    projectFossils: {},

    draggingFossil: null,
    selectedFossil: null,
    selectedScan: null,
    selectedFossils: [],
    mode: '2d',

    canvasFossils: [],

}